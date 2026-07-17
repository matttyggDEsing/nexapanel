'use strict';

const { pool }    = require('../../config/db');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/response');
const { paginate } = require('../../utils/pagination');

// ── Crear recibo a partir de una venta ────────────────────────────────────
const createReceipt = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const sellerId = req.user.id;
    const { sale_id, notes, status } = req.body;

    if (!sale_id) { conn.release(); return errorResponse(res, 'sale_id es requerido', 400); }

    await conn.beginTransaction();

    // Verificar que la venta pertenece al vendedor (dentro de la transacción)
    const [[sale]] = await conn.query(
      'SELECT * FROM seller_sales WHERE id = ? AND seller_id = ? FOR UPDATE',
      [sale_id, sellerId]
    );
    if (!sale) { await conn.rollback(); conn.release(); return errorResponse(res, 'Venta no encontrada', 404); }

    // Verificar que no exista ya un recibo para esa venta
    const [[existing]] = await conn.query(
      'SELECT id FROM seller_receipts WHERE sale_id = ? FOR UPDATE',
      [sale_id]
    );
    if (existing) {
      await conn.rollback(); conn.release();
      return errorResponse(res, `Ya existe el recibo ${existing.id} para esta venta`, 409);
    }

    // Generar número de recibo único (FOR UPDATE sobre el MAX evita duplicados)
    const [[{ maxNum }]] = await conn.query(
      "SELECT IFNULL(MAX(CAST(SUBSTRING(receipt_number, 5) AS UNSIGNED)), 0) + 1 AS maxNum FROM seller_receipts FOR UPDATE"
    );
    const receipt_number = `REC-${String(maxNum).padStart(5, '0')}`;

    const [result] = await conn.query(
      `INSERT INTO seller_receipts (receipt_number, sale_id, seller_id, customer_id, total, payment_method, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        receipt_number,
        sale_id,
        sellerId,
        sale.customer_id,
        sale.total,
        sale.payment_method,
        status || 'paid',
        notes || null,
      ]
    );

    await conn.commit();
    conn.release();

    return successResponse(res, { id: result.insertId, receipt_number }, 'Recibo generado', 201);
  } catch (err) {
    try { await conn.rollback(); } catch (_) {}
    conn.release();
    next(err);
  }
};

// ── Listar recibos del vendedor ────────────────────────────────────────────
const getReceipts = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const { limit, offset, pagination } = paginate(req.query, 0);

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM seller_receipts WHERE seller_id = ?',
      [sellerId]
    );

    const [rows] = await pool.query(
      `SELECT sr.*,
              sc.first_name, sc.last_name, sc.email AS customer_email
       FROM seller_receipts sr
       JOIN seller_customers sc ON sc.id = sr.customer_id
       WHERE sr.seller_id = ?
       ORDER BY sr.created_at DESC LIMIT ? OFFSET ?`,
      [sellerId, limit, offset]
    );

    return paginatedResponse(res, rows, {
      ...pagination, total, totalPages: Math.ceil(total / pagination.perPage),
    });
  } catch (err) { next(err); }
};

// ── Obtener recibo con detalle completo ────────────────────────────────────
const getReceipt = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    const [[receipt]] = await pool.query(
      `SELECT sr.*,
              u.name AS seller_name, u.email AS seller_email,
              sc.first_name, sc.last_name, sc.email AS customer_email, sc.whatsapp
       FROM seller_receipts sr
       JOIN users u ON u.id = sr.seller_id
       JOIN seller_customers sc ON sc.id = sr.customer_id
       WHERE sr.id = ? AND sr.seller_id = ?`,
      [req.params.id, sellerId]
    );
    if (!receipt) return errorResponse(res, 'Recibo no encontrado', 404);

    const [items] = await pool.query(
      `SELECT ssi.*, s.name AS service_name
       FROM seller_sale_items ssi
       JOIN services s ON s.id = ssi.service_id
       WHERE ssi.sale_id = ?`,
      [receipt.sale_id]
    );

    return successResponse(res, { ...receipt, items });
  } catch (err) { next(err); }
};

module.exports = { createReceipt, getReceipts, getReceipt };
