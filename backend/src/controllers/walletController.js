const { pool }         = require('../config/db');
const env              = require('../config/env');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { paginate }     = require('../utils/pagination');
const paymentService   = require('../services/paymentService');
const logger           = require('../utils/logger');

const getWallet = async (req, res, next) => {
  try {
    const [[user]] = await pool.query(
      'SELECT balance FROM users WHERE id = ? LIMIT 1',
      [req.user.id],
    );
    if (!user) return errorResponse(res, 'Usuario no encontrado', 404);
    return successResponse(res, { balance: parseFloat(user.balance), currency: 'USD' });
  } catch (err) { next(err); }
};

const getBalance = getWallet;

const getTransactions = async (req, res, next) => {
  try {
    const { limit, offset, pagination } = paginate(req.query, 0);
    const { type } = req.query;
    const conditions = ['t.user_id = ?'];
    const params     = [req.user.id];
    if (type === 'credit' || type === 'debit') {
      conditions.push('t.type = ?');
      params.push(type);
    }
    const where = conditions.join(' AND ');
    const [rows] = await pool.query(
      `SELECT t.id, t.type, t.amount, t.balance_before, t.balance_after,
              t.description, t.method, t.reference, t.status, t.created_at,
              o.link AS order_link
       FROM transactions t
       LEFT JOIN orders o ON o.id = t.order_id
       WHERE ${where}
       ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM transactions t WHERE ${where}`, params,
    );
    return paginatedResponse(res, rows, { ...pagination, total, totalPages: Math.ceil(total / pagination.perPage) });
  } catch (err) { next(err); }
};

const requestDeposit = async (req, res, next) => {
  try {
    const { amount, method = 'manual' } = req.body;
    if (!amount || isNaN(amount) || parseFloat(amount) < 1) {
      return errorResponse(res, 'El monto mínimo de depósito es $1.00', 400);
    }
    const VALID_METHODS = ['crypto', 'paypal', 'manual', 'mercadopago'];
    if (!VALID_METHODS.includes(method)) {
      return errorResponse(res, `Método inválido. Usa: ${VALID_METHODS.join(', ')}`, 400);
    }
    const [result] = await pool.query(
      `INSERT INTO deposit_requests (user_id, amount, method, status)
       VALUES (?, ?, ?, 'pending')`,
      [req.user.id, parseFloat(amount), method],
    );
    logger.info(`Deposit request #${result.insertId} by user ${req.user.id} for $${amount}`);
    return successResponse(
      res, { id: result.insertId, amount: parseFloat(amount), method, status: 'pending' },
      'Solicitud de depósito creada.', 201,
    );
  } catch (err) { next(err); }
};

const getDeposits = async (req, res, next) => {
  try {
    const { limit, offset, pagination } = paginate(req.query, 0);
    const [rows] = await pool.query(
      `SELECT id, amount, method, status, external_ref, created_at, updated_at
       FROM deposit_requests WHERE user_id = ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset],
    );
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM deposit_requests WHERE user_id = ?', [req.user.id],
    );
    return paginatedResponse(res, rows, { ...pagination, total, totalPages: Math.ceil(total / pagination.perPage) });
  } catch (err) { next(err); }
};

const createPayPalOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || parseFloat(amount) < 1) {
      return errorResponse(res, 'Monto inválido (mínimo $1)', 400);
    }
    const [result] = await pool.query(
      `INSERT INTO deposit_requests (user_id, amount, method, status)
       VALUES (?, ?, 'paypal', 'pending')`,
      [req.user.id, parseFloat(amount)],
    );
    const { id, status } = await paymentService.createPayPalOrder(
      parseFloat(amount), req.user.id, result.insertId,
    );
    await pool.query(
      `UPDATE deposit_requests SET external_ref = ? WHERE id = ?`,
      [id, result.insertId],
    );
    return successResponse(res, { paypalOrderId: id, depositId: result.insertId, status }, 201);
  } catch (err) { next(err); }
};

const createMercadoPagoPreference = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || parseFloat(amount) < 1) {
      return errorResponse(res, 'Monto inválido (mínimo $1)', 400);
    }
    const [result] = await pool.query(
      `INSERT INTO deposit_requests (user_id, amount, method, status)
       VALUES (?, ?, 'mercadopago', 'pending')`,
      [req.user.id, parseFloat(amount)],
    );
    const depositId = result.insertId;
    const { MercadoPagoConfig, Preference } = require('mercadopago');
    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
    const body = {
      items: [{ title: 'Depósito NexaPanel', quantity: 1, unit_price: parseFloat(amount), currency_id: 'USD' }],
      external_reference: `${req.user.id}`,
      metadata: { deposit_id: depositId },
      auto_return: 'approved',
      back_urls: { success: `${env.FRONTEND_URL}/wallet`, failure: `${env.FRONTEND_URL}/wallet`, pending: `${env.FRONTEND_URL}/wallet` },
      notification_url: `${process.env.NOTIFICATION_URL || `${env.FRONTEND_URL}`}/api/webhooks/mercadopago`,
    };
    const preference = await new Preference(client).create({ body });
    await pool.query(
      `UPDATE deposit_requests SET external_ref = ? WHERE id = ?`,
      [preference.id, depositId],
    );
    return successResponse(res, { initPoint: preference.init_point, preferenceId: preference.id, depositId }, 201);
  } catch (err) { next(err); }
};

const capturePayPalOrder = async (req, res, next) => {
  try {
    const paypalOrderId = req.params.paypalOrderId;
    const { status, customId } = await paymentService.capturePayPalOrder(paypalOrderId);
    if (status !== 'COMPLETED') {
      return errorResponse(res, 'PayPal no completó la captura', 400);
    }
    const [userIdStr, depositIdStr] = customId.split(':');
    const depositId = parseInt(depositIdStr);
    const userId = parseInt(userIdStr);
    if (!depositId || userId !== req.user.id) {
      return errorResponse(res, 'Orden PayPal no corresponde al usuario', 400);
    }
    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();
      const [[deposit]] = await conn.query(
        `SELECT * FROM deposit_requests WHERE id = ? AND status = 'pending' FOR UPDATE`,
        [depositId],
      );
      if (!deposit) { await conn.rollback(); return errorResponse(res, 'Depósito no encontrado o ya procesado', 404); }
      await conn.query(`UPDATE deposit_requests SET status = 'completed', updated_at = NOW() WHERE id = ?`, [depositId]);
      const [[userRow]] = await conn.query('SELECT balance FROM users WHERE id = ? FOR UPDATE', [userId]);
      const balanceBefore = parseFloat(userRow.balance);
      const amount = parseFloat(deposit.amount);
      await conn.query('UPDATE users SET balance = balance + ?, updated_at = NOW() WHERE id = ?', [amount, userId]);
      await conn.query(
        `INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, description, method, reference, status)
         VALUES (?, 'credit', ?, ?, ?, ?, 'paypal', ?, 'completed')`,
        [userId, amount, balanceBefore, balanceBefore + amount, `Depósito vía PayPal`, paypalOrderId],
      );
      await conn.commit();
      logger.info(`[PayPal] Capture #${depositId} completado: $${amount}`);
      return successResponse(res, { newBalance: balanceBefore + amount }, 'Depósito completado');
    } catch (err) { if (conn) { try { await conn.rollback(); } catch (_) {} } next(err); }
    finally { if (conn) conn.release(); }
  } catch (err) { next(err); }
};

const getInvoice = async (req, res, next) => {
  try {
    const [[deposit]] = await pool.query(
      `SELECT dr.*, u.name AS user_name, u.email AS user_email
       FROM deposit_requests dr JOIN users u ON u.id = dr.user_id
       WHERE dr.id = ? AND dr.user_id = ? LIMIT 1`,
      [req.params.id, req.user.id],
    );
    if (!deposit) return errorResponse(res, 'Depósito no encontrado', 404);
    return successResponse(res, {
      id: deposit.id, amount: parseFloat(deposit.amount), method: deposit.method,
      status: deposit.status, external_ref: deposit.external_ref,
      created_at: deposit.created_at, user_name: deposit.user_name, user_email: deposit.user_email,
    });
  } catch (err) { next(err); }
};

module.exports = {
  getWallet, getBalance, getTransactions, requestDeposit, getDeposits,
  createPayPalOrder, capturePayPalOrder, createMercadoPagoPreference, getInvoice,
};