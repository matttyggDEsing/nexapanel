'use strict';

const { pool }       = require('../config/db');
const userModel      = require('../models/userModel');
const orderModel     = require('../models/orderModel');
const ticketModel    = require('../models/ticketModel');
const serviceModel   = require('../models/serviceModel');
const providerModel  = require('../models/providerModel');
const smm              = require('../services/smmProvider');
const balanceMonitor   = require('../services/balanceMonitor');
const providerFundingModel = require('../models/providerFundingModel');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { paginate }   = require('../utils/pagination');
const logger          = require('../utils/logger');

// NOTA: la configuración del panel (incluyendo modo mantenimiento) vive en la
// tabla `settings` de la base de datos y se maneja desde settingsController.js
// / routes/settings.js. Antes había acá una segunda implementación basada en
// un archivo data/settings.json que tapaba esas rutas (mismo path, registrada
// antes en server.js) y dejaba el sistema "bueno" como código muerto. Se quitó
// para que quede una sola fuente de verdad.

// ── Dashboard ──────────────────────────────────────────────────────────────────
const getStats = async (req, res, next) => {
  try {
    const [[users]]   = await pool.query(`SELECT COUNT(*) AS total_users, COALESCE(SUM(CASE WHEN status='active' THEN 1 ELSE 0 END),0) AS active_users FROM users`);
    const [[orders]]  = await pool.query(`SELECT COUNT(*) AS total_orders, COALESCE(SUM(charge),0) AS total_revenue, COALESCE(SUM(profit),0) AS total_profit, COALESCE(SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END),0) AS pending_orders FROM orders`);
    const [[tickets]] = await pool.query(`SELECT COUNT(*) AS total_tickets, COALESCE(SUM(CASE WHEN status='open' THEN 1 ELSE 0 END),0) AS open_tickets FROM tickets`);
    return successResponse(res, { users, orders, tickets });
  } catch (err) { next(err); }
};

const getChart = async (req, res, next) => {
  try {
    const range = req.query.range || '30d';
    const days  = range === '90d' ? 90 : range === '7d' ? 7 : 30;
    const [rows] = await pool.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS orders,
              COALESCE(SUM(charge),0) AS revenue, COALESCE(SUM(profit),0) AS profit
       FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [days]
    );
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const found = rows.find(r => (r.date?.toISOString?.().slice(0, 10) ?? r.date) === dateStr);
      result.push({ date: dateStr, orders: found ? Number(found.orders) : 0, revenue: found ? Number(found.revenue) : 0, profit: found ? Number(found.profit) : 0 });
    }
    return successResponse(res, result);
  } catch (err) { next(err); }
};

const getRecentOrders = async (req, res, next) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const [rows] = await pool.query(
      `SELECT o.id, o.link, o.quantity, o.charge, o.status, o.created_at,
              s.name AS service_name, u.email AS user_email
       FROM orders o
       JOIN services s ON s.id = o.service_id
       JOIN users   u ON u.id = o.user_id
       ORDER BY o.created_at DESC LIMIT ?`,
      [limit]
    );
    return successResponse(res, rows);
  } catch (err) { next(err); }
};

// ── Users ──────────────────────────────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const { limit, offset, pagination } = paginate(req.query, 0);
    const { search, status } = req.query;
    const { rows, total } = await userModel.findAll({ limit, offset, search, status });
    return paginatedResponse(res, rows, { ...pagination, total, totalPages: Math.ceil(total / pagination.perPage) });
  } catch (err) { next(err); }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active','banned','pending'].includes(status)) return errorResponse(res, 'Estado inválido', 400);
    await userModel.updateStatus(req.params.id, status);
    return successResponse(res, null, 'Estado actualizado');
  } catch (err) { next(err); }
};

const adminAddFunds = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const amount = parseFloat(req.body.amount);
    const userId = parseInt(req.params.id);
    if (!amount || amount <= 0) { conn.release(); return errorResponse(res, 'Monto inválido', 400); }
    await conn.beginTransaction();
    const [[userRow]] = await conn.query('SELECT balance FROM users WHERE id = ? FOR UPDATE', [userId]);
    if (!userRow) { await conn.rollback(); conn.release(); return errorResponse(res, 'Usuario no encontrado', 404); }
    const balanceBefore = parseFloat(userRow.balance);
    await conn.query('UPDATE users SET balance = balance + ?, updated_at = NOW() WHERE id = ?', [amount, userId]);
    await conn.query(
      `INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, description, method, status)
       VALUES (?, 'credit', ?, ?, ?, 'Recarga manual por administrador', 'manual', 'completed')`,
      [userId, amount, balanceBefore, balanceBefore + amount]
    );
    await conn.commit(); conn.release();
    return successResponse(res, { balance: balanceBefore + amount }, 'Fondos añadidos');
  } catch (err) {
    try { await conn.rollback(); } catch (_) {}
    conn.release(); next(err);
  }
};

// ── Orders ─────────────────────────────────────────────────────────────────────
const getOrders = async (req, res, next) => {
  try {
    const { limit, offset, pagination } = paginate(req.query, 0);
    const { status, userId } = req.query;
    const { rows, total } = await orderModel.getAll({ limit, offset, status, userId });
    return paginatedResponse(res, rows, { ...pagination, total, totalPages: Math.ceil(total / pagination.perPage) });
  } catch (err) { next(err); }
};

// ── Tickets ────────────────────────────────────────────────────────────────────
const getTickets = async (req, res, next) => {
  try {
    const { limit, offset, pagination } = paginate(req.query, 0);
    const { status } = req.query;
    const { rows, total } = await ticketModel.getAll({ limit, offset, status });
    return paginatedResponse(res, rows, { ...pagination, total, totalPages: Math.ceil(total / pagination.perPage) });
  } catch (err) { next(err); }
};

const adminReplyTicket = async (req, res, next) => {
  try {
    await ticketModel.addMessage(req.params.id, req.user.id, req.body.message, true);
    return successResponse(res, null, 'Respuesta enviada');
  } catch (err) { next(err); }
};

const adminGetTicketMessages = async (req, res, next) => {
  try {
    const messages = await ticketModel.getMessages(req.params.id);
    return successResponse(res, messages);
  } catch (err) { next(err); }
};

// ── Providers ──────────────────────────────────────────────────────────────────
const getProviders = async (req, res, next) => {
  try {
    const providers = await providerModel.getAll();
    return successResponse(res, providers);
  } catch (err) { next(err); }
};

const createProvider = async (req, res, next) => {
  try {
    const { name, api_url, api_key } = req.body;
    if (!name || !api_url || !api_key) return errorResponse(res, 'name, api_url y api_key son requeridos', 400);
    const id = await providerModel.create({ name, api_url, api_key });
    return successResponse(res, { id }, 'Proveedor creado', 201);
  } catch (err) { next(err); }
};

// FIX: faltaba updateProvider para PUT /admin/providers/:id
const updateProvider = async (req, res, next) => {
  try {
    const { name, api_url, api_key } = req.body;
    const updates = [];
    const values  = [];
    if (name)    { updates.push('name = ?');    values.push(name); }
    if (api_url) { updates.push('api_url = ?'); values.push(api_url); }
    if (api_key) { updates.push('api_key = ?'); values.push(api_key); }
    if (!updates.length) return errorResponse(res, 'No hay campos para actualizar', 400);
    values.push(req.params.id);
    await pool.query(`UPDATE providers SET ${updates.join(', ')} WHERE id = ?`, values);
    return successResponse(res, null, 'Proveedor actualizado');
  } catch (err) { next(err); }
};

const deleteProvider = async (req, res, next) => {
  try {
    const [[svc]] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM services WHERE provider_id = ?',
      [req.params.id],
    );
    if (svc && svc.cnt > 0) {
      return errorResponse(res, `No se puede eliminar: el proveedor tiene ${svc.cnt} servicio(s) vinculado(s). Desactivá los servicios primero.`, 409);
    }
    await pool.query('DELETE FROM providers WHERE id = ?', [req.params.id]);
    return successResponse(res, null, 'Proveedor eliminado');
  } catch (err) { next(err); }
};

// Keywords para filtros de calidad y país

const QUALITY_KEYWORDS = ['premium', 'hq', 'high quality', 'real', 'organic', 'genuine', 'natural', 'non drop', 'nondrop', 'lifetime'];
const USA_KEYWORDS     = ['usa', 'us', 'united states', 'american', 'america'];

const SERVICE_TYPE_KEYWORDS = {
  followers: ['follower', 'seguidores', 'subscribers', 'suscriptores', 'fans'],
  likes:     ['like', 'likes', 'heart', 'reaction', 'me gusta'],
  comments:  ['comment', 'comentario', 'review', 'reseña'],
  reach:     ['reach', 'view', 'vista', 'impression', 'impresion', 'play', 'watch', 'stream', 'stories'],
};

function applyFilters(services, filters = {}) {
  const { categories = [], serviceTypes = [], qualityOnly = false, usaOnly = false } = filters;
  let filtered = 0;

  const result = services.filter(s => {
    const name = (s.name ?? '').toLowerCase();
    const cat  = (s.category ?? '');

    // Filtro de categorías del proveedor
    if (categories.length > 0 && !categories.includes(cat)) {
      filtered++;
      return false;
    }

    // Filtro de tipo de servicio (likes, comments, followers, reach)
    if (serviceTypes.length > 0) {
      const matchesAnyType = serviceTypes.some(typeId => {
        const keywords = SERVICE_TYPE_KEYWORDS[typeId] ?? [];
        return keywords.some(k => name.includes(k));
      });
      if (!matchesAnyType) {
        filtered++;
        return false;
      }
    }

    // Filtro de calidad
    if (qualityOnly) {
      const isQuality = QUALITY_KEYWORDS.some(k => name.includes(k));
      if (!isQuality) {
        filtered++;
        return false;
      }
    }

    // Filtro de país
    if (usaOnly) {
      const isUSA = USA_KEYWORDS.some(k => name.includes(k));
      if (!isUSA) {
        filtered++;
        return false;
      }
    }

    return true;
  });

  return { result, filtered };
}

const syncProvider = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const filters = req.body?.filters ?? {};

    const provider = await providerModel.findById(id);
    if (!provider) return errorResponse(res, 'Proveedor no encontrado', 404);

    const rawServices = await smm.getServices(provider.api_url, provider.api_key);
    if (!Array.isArray(rawServices) || rawServices.length === 0) {
      return errorResponse(res, 'El proveedor no devolvió servicios', 502);
    }

    // Aplicar filtros antes de sincronizar
    const { result: toSync, filtered } = applyFilters(rawServices, filters);

    if (toSync.length === 0) {
      return successResponse(
        res,
        { synced: 0, filtered, total: rawServices.length },
        `Ningún servicio pasó los filtros (${filtered} descartados de ${rawServices.length})`,
      );
    }

    const { synced } = await serviceModel.syncFromProvider(toSync, id);

    await pool.query(
      `UPDATE providers SET last_sync = NOW(), status = 'active' WHERE id = ?`,
      [id],
    );

    logger.info(`Admin ${req.user.id} synced provider #${id}: ${synced} synced, ${filtered} filtered out`);
    return successResponse(
      res,
      { synced, filtered, total: rawServices.length },
      `${synced} servicios sincronizados (${filtered} descartados por filtros)`,
    );
  } catch (err) {
    await pool.query(`UPDATE providers SET status = 'error' WHERE id = ?`, [parseInt(req.params.id)]).catch(() => {});
    next(err);
  }
};

// GET /admin/providers/:id/balance
const getProviderBalance = async (req, res, next) => {
  try {
    const provider = await providerModel.findById(req.params.id);
    if (!provider) return errorResponse(res, 'Proveedor no encontrado', 404);
    const data = await smm.getBalance(provider.api_url, provider.api_key);
    await providerModel.updateBalance(provider.id, parseFloat(data.balance));
    return successResponse(res, { balance: data.balance, currency: data.currency ?? 'USD' });
  } catch (err) { next(err); }
};

// ── Services ───────────────────────────────────────────────────────────────────
const getAllServices = async (req, res, next) => {
  try {
    const { limit, offset, pagination } = paginate(req.query, 0);
    const { search, category_id, is_active } = req.query;
    const { rows, total } = await serviceModel.getAll({
      limit, offset, search,
      categoryId: category_id ? parseInt(category_id) : null,
      isActive:   is_active !== undefined ? parseInt(is_active) : null,
    });
    return paginatedResponse(res, rows, { ...pagination, total, totalPages: Math.ceil(total / pagination.perPage) });
  } catch (err) { next(err); }
};

const createService = async (req, res, next) => {
  try {
    const { provider_id, category_id, provider_service_id = 0, name, description = '', rate, min_order, max_order, type = 'Default', refill = false, cancel = false } = req.body;
    const id = await serviceModel.create({ provider_id, category_id, provider_service_id, name, description, rate: parseFloat(rate), min_order: parseInt(min_order), max_order: parseInt(max_order), type, refill, cancel });
    return successResponse(res, { id }, 'Servicio creado', 201);
  } catch (err) { next(err); }
};

const updateService = async (req, res, next) => {
  try {
    await serviceModel.update(req.params.id, req.body);
    return successResponse(res, null, 'Servicio actualizado');
  } catch (err) { next(err); }
};

const deleteService = async (req, res, next) => {
  try {
    const [[ord]] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM orders WHERE service_id = ?',
      [req.params.id],
    );
    if (ord && ord.cnt > 0) {
      return errorResponse(res, `No se puede eliminar: el servicio tiene ${ord.cnt} orden(es) vinculada(s). Desactivá el servicio en vez de eliminarlo.`, 409);
    }
    await pool.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    return successResponse(res, null, 'Servicio eliminado');
  } catch (err) { next(err); }
};

const importServices = async (req, res, next) => {
  try {
    const { provider_id, category_id, category_filter } = req.body;
    const provider = await providerModel.findById(provider_id);
    if (!provider) return errorResponse(res, 'Proveedor no encontrado', 404);

    const smmServices = await smm.getServices(provider.api_url, provider.api_key);
    const toImport = category_filter
      ? smmServices.filter(s => s.category?.toLowerCase().includes(category_filter.toLowerCase()))
      : smmServices;
    let imported = 0, skipped = 0;
    for (const svc of toImport) {
      try {
        await serviceModel.create({
          provider_id, category_id,
          provider_service_id: svc.service ?? svc.provider_service_id ?? 0,
          name: svc.name, description: svc.description || '',
          rate: parseFloat(svc.rate), min_order: parseInt(svc.min ?? svc.min_order ?? 1),
          max_order: parseInt(svc.max ?? svc.max_order ?? 1000000),
          type: svc.type || 'Default', refill: svc.refill || false, cancel: svc.cancel || false,
        });
        imported++;
      } catch (err) { skipped++; logger.warn(`[Admin] Error importando servicio: ${err.message}`); }
    }
    return successResponse(res, { imported, skipped, total: toImport.length }, `${imported} servicios importados`);
  } catch (err) { next(err); }
};

const syncServices = async (req, res, next) => {
  try {
    const { provider_id } = req.body;
    const provider = await providerModel.findById(provider_id);
    if (!provider) return errorResponse(res, 'Proveedor no encontrado (provider_id requerido)', 400);

    const smmServices = await smm.getServices(provider.api_url, provider.api_key);
    const { synced }  = await serviceModel.syncFromProvider(smmServices, provider.id);
    return successResponse(res, { synced }, `${synced} servicios sincronizados`);
  } catch (err) { next(err); }
};

const getProviderCategories = async (req, res, next) => {
  try {
    const provider_id = req.query.provider_id;
    const provider = await providerModel.findById(provider_id);
    if (!provider) return errorResponse(res, 'Proveedor no encontrado (provider_id requerido)', 400);

    const smmServices = await smm.getServices(provider.api_url, provider.api_key);
    const cats = [...new Set(smmServices.map(s => s.category).filter(Boolean))].sort();
    return successResponse(res, cats);
  } catch (err) { next(err); }
};
const getDeposits = async (req, res, next) => {
  try {
    const { limit, offset, pagination } = paginate(req.query, 0);
    const { status } = req.query;
    const conditions = [];
    const params = [];
    if (status) { conditions.push('dr.status = ?'); params.push(status); }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const [rows] = await pool.query(
      `SELECT dr.id, dr.user_id, dr.amount, dr.method, dr.status,
              dr.external_ref, dr.notes, dr.created_at, dr.updated_at,
              u.name AS user_name, u.email AS user_email
       FROM deposit_requests dr
       JOIN users u ON u.id = dr.user_id
       ${where}
       ORDER BY dr.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM deposit_requests dr ${where}`, params,
    );
    return paginatedResponse(res, rows, { ...pagination, total, totalPages: Math.ceil(total / pagination.perPage) });
  } catch (err) { next(err); }
};

const approveDeposit = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[deposit]] = await conn.query(
      `SELECT * FROM deposit_requests WHERE id = ? AND status = 'pending' FOR UPDATE`,
      [req.params.id],
    );
    if (!deposit) { await conn.rollback(); conn.release(); return errorResponse(res, 'No encontrado o ya procesado', 404); }
    await conn.query(`UPDATE deposit_requests SET status = 'completed', updated_at = NOW() WHERE id = ?`, [deposit.id]);
    const [[userRow]] = await conn.query('SELECT balance FROM users WHERE id = ? FOR UPDATE', [deposit.user_id]);
    const balanceBefore = parseFloat(userRow.balance);
    const amount = parseFloat(deposit.amount);
    await conn.query('UPDATE users SET balance = balance + ?, updated_at = NOW() WHERE id = ?', [amount, deposit.user_id]);
    await conn.query(
      `INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, description, method, reference, status)
       VALUES (?, 'credit', ?, ?, ?, ?, ?, ?, 'completed')`,
      [deposit.user_id, amount, balanceBefore, balanceBefore + amount,
       `Depósito aprobado (${deposit.method})`, deposit.method, String(deposit.id)],
    );
    await conn.commit(); conn.release();
    return successResponse(res, { newBalance: balanceBefore + amount }, 'Depósito aprobado');
  } catch (err) { try { await conn.rollback(); } catch (_) {} conn.release(); next(err); }
};

const rejectDeposit = async (req, res, next) => {
  try {
    const { reason = '' } = req.body;
    const [result] = await pool.query(
      `UPDATE deposit_requests SET status = 'rejected', notes = ?, updated_at = NOW() WHERE id = ? AND status = 'pending'`,
      [reason || 'Rechazado por administrador', req.params.id],
    );
    if (result.affectedRows === 0) return errorResponse(res, 'No encontrado o ya procesado', 404);
    return successResponse(res, null, 'Depósito rechazado');
  } catch (err) { next(err); }
};
const applyMarkup = async (req, res, next) => {
  try {
    const { markup_percent, provider_id = null } = req.body;
    if (isNaN(parseFloat(markup_percent)) || parseFloat(markup_percent) < 0)
      return errorResponse(res, 'markup_percent inválido', 400);
    const { updated } = await serviceModel.applyMarkup(parseFloat(markup_percent), provider_id ? parseInt(provider_id) : null);
    return successResponse(res, { updated }, `Markup del ${markup_percent}% aplicado a ${updated} servicios`);
  } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    if (userId === req.user.id) {
      return errorResponse(res, 'No podés eliminar tu propia cuenta', 400);
    }
    await pool.query('DELETE FROM users WHERE id = ? AND role != "admin"', [userId]);
    return successResponse(res, null, 'Usuario eliminado');
  } catch (err) { next(err); }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'staff', 'admin', 'seller'].includes(role)) {
      return errorResponse(res, 'Rol inválido. Usa: user, staff, admin, seller', 400);
    }
    const targetId = parseInt(req.params.id);
    if (targetId === req.user.id) {
      return errorResponse(res, 'No podés cambiar tu propio rol', 400);
    }
    await userModel.updateRole(targetId, role);
    return successResponse(res, null, 'Rol actualizado');
  } catch (err) { next(err); }
};
// ── Provider Finance ──────────────────────────────────────────────────
const getProviderFinanceOverview = async (req, res, next) => {
  try {
    const providers = await providerModel.getAll();

    const [costs] = await pool.query(
      `SELECT provider_id,
              COALESCE(SUM(cost), 0) AS total_cost,
              COALESCE(SUM(charge), 0) AS total_charge,
              COALESCE(SUM(profit), 0) AS total_profit,
              COUNT(*) AS order_count
       FROM orders GROUP BY provider_id`,
    );
    const costMap = {};
    for (const c of costs) {
      costMap[c.provider_id] = { total_cost: parseFloat(c.total_cost), total_charge: parseFloat(c.total_charge), total_profit: parseFloat(c.total_profit), order_count: c.order_count };
    }

    const fundRows = await providerFundingModel.getAllTotals();
    const fundMap = {};
    for (const f of fundRows) fundMap[f.provider_id] = f.total_funded;

    const result = providers.map(p => ({
      id: p.id, name: p.name, status: p.status,
      balance: p.balance ? parseFloat(p.balance) : 0,
      last_sync: p.last_sync,
      funded: fundMap[p.id] || 0,
      cost: costMap[p.id]?.total_cost || 0,
      charge: costMap[p.id]?.total_charge || 0,
      profit: costMap[p.id]?.total_profit || 0,
      orders: costMap[p.id]?.order_count || 0,
      net_position: (fundMap[p.id] || 0) - (costMap[p.id]?.total_cost || 0),
    }));

    const totals = result.reduce((a, r) => ({
      funded: a.funded + r.funded,
      cost: a.cost + r.cost,
      charge: a.charge + r.charge,
      profit: a.profit + r.profit,
      orders: a.orders + r.orders,
    }), { funded: 0, cost: 0, charge: 0, profit: 0, orders: 0 });

    return successResponse(res, { providers: result, totals });
  } catch (err) { next(err); }
};

const recordProviderFunding = async (req, res, next) => {
  try {
    const providerId = parseInt(req.params.id);
    const provider = await providerModel.findById(providerId);
    if (!provider) return errorResponse(res, 'Proveedor no encontrado', 404);

    const { amount, method = 'manual', reference, notes } = req.body;
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return errorResponse(res, 'Monto inválido', 400);
    }

    let balanceBefore = null;
    let balanceAfter = null;
    try {
      const data = await smm.getBalance(provider.api_url, provider.api_key);
      balanceBefore = parseFloat(data.balance);
    } catch (_) {}

    const id = await providerFundingModel.create({
      provider_id: providerId,
      amount: parseFloat(amount),
      balance_before: balanceBefore,
      method, reference, notes,
    });

    if (balanceBefore !== null) {
      balanceAfter = balanceBefore + parseFloat(amount);
      await providerModel.updateBalance(providerId, balanceAfter);
    }

    return successResponse(res, { id, balance_before: balanceBefore, balance_after: balanceAfter }, 'Recarga registrada', 201);
  } catch (err) { next(err); }
};

const getFundingHistory = async (req, res, next) => {
  try {
    const providerId = parseInt(req.params.id);
    const { limit, offset, pagination } = paginate(req.query, 0);
    const { rows, total } = await providerFundingModel.findByProvider(providerId, { limit, offset });
    return paginatedResponse(res, rows, { ...pagination, total, totalPages: Math.ceil(total / pagination.perPage) });
  } catch (err) { next(err); }
};

const getProviderCostAnalysis = async (req, res, next) => {
  try {
    const providerId = parseInt(req.params.id);
    const provider = await providerModel.findById(providerId);
    if (!provider) return errorResponse(res, 'Proveedor no encontrado', 404);

    const [monthly] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
              COUNT(*) AS orders,
              COALESCE(SUM(cost), 0) AS cost,
              COALESCE(SUM(charge), 0) AS charge,
              COALESCE(SUM(profit), 0) AS profit
       FROM orders WHERE provider_id = ?
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`,
      [providerId],
    );

    const [[{ total_cost, total_charge, total_profit, total_orders }]] = await pool.query(
      `SELECT COUNT(*) AS total_orders,
              COALESCE(SUM(cost), 0) AS total_cost,
              COALESCE(SUM(charge), 0) AS total_charge,
              COALESCE(SUM(profit), 0) AS total_profit
       FROM orders WHERE provider_id = ?`,
      [providerId],
    );

    const funded = await providerFundingModel.getProviderTotals(providerId);
    const balance = provider.balance ? parseFloat(provider.balance) : 0;

    return successResponse(res, {
      provider: { id: provider.id, name: provider.name, balance, last_sync: provider.last_sync },
      totals: {
        orders: total_orders,
        cost: parseFloat(total_cost),
        charge: parseFloat(total_charge),
        profit: parseFloat(total_profit),
        funded,
        net_position: funded - parseFloat(total_cost),
      },
      monthly: monthly.map(m => ({ ...m, orders: m.orders, cost: parseFloat(m.cost), charge: parseFloat(m.charge), profit: parseFloat(m.profit) })),
    });
  } catch (err) { next(err); }
};

const getBalanceAlerts = async (req, res, next) => {
  try {
    return successResponse(res, balanceMonitor.getAlerts());
  } catch (err) { next(err); }
};

module.exports = {
  getStats, getChart, getRecentOrders, applyMarkup,
  getUsers, updateUserStatus, adminAddFunds, deleteUser, updateUserRole,
  getOrders, rejectDeposit, approveDeposit, getDeposits,
  getTickets, adminReplyTicket, adminGetTicketMessages,
  getProviders, createProvider, updateProvider, deleteProvider, syncProvider, getProviderBalance,
  getAllServices, createService, updateService, deleteService, importServices, syncServices, getProviderCategories,
  getProviderFinanceOverview, recordProviderFunding, getFundingHistory, getProviderCostAnalysis,
  getBalanceAlerts,
};







