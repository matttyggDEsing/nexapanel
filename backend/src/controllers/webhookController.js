'use strict';

const { pool } = require('../config/db');
const env = require('../config/env');
const { verifyPayPal, verifyMercadoPago } = require('../utils/webhookVerifiers');
const logger = require('../utils/logger');

const creditWallet = async (userId, amount, method, reference, description) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[user]] = await conn.query('SELECT balance FROM users WHERE id = ? FOR UPDATE', [userId]);
    if (!user) { await conn.rollback(); conn.release(); return null; }
    const balanceBefore = parseFloat(user.balance);
    const balanceAfter = balanceBefore + parseFloat(amount);
    await conn.query('UPDATE users SET balance = ? WHERE id = ?', [balanceAfter, userId]);
    await conn.query(
      `INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, description, method, reference, status)
       VALUES (?, 'credit', ?, ?, ?, ?, ?, ?, 'completed')`,
      [userId, parseFloat(amount), balanceBefore, balanceAfter, description, method, reference],
    );
    await conn.commit();
    conn.release();
    return balanceAfter;
  } catch (err) {
    await conn.rollback();
    conn.release();
    throw err;
  }
};

const completeDepositRequest = async (depositRequestId, externalRef) => {
  await pool.query(
    `UPDATE deposit_requests SET status = 'completed', external_ref = ?, updated_at = NOW()
     WHERE id = ? AND status = 'pending'`,
    [externalRef, depositRequestId],
  );
};

/* ─── PayPal ──────────────────────────────────────────────────── */
const handlePayPal = async (req, res) => {
  const valid = await verifyPayPal(req.headers, req.body);
  if (!valid) return res.status(400).json({ error: 'Firma inválida' });
  const event = req.body;
  logger.info(`[Webhook] PayPal event: ${event.event_type} (${event.id})`);
  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const resource = event.resource;
    const amount = parseFloat(resource.amount?.value || 0);
    const customId = resource.custom_id || '';
    const userId = parseInt(customId, 10);
    if (!userId || !amount || amount <= 0) return res.status(200).json({ received: true });
    try {
      await creditWallet(userId, amount, 'paypal', resource.id, `Depósito vía PayPal (${resource.id})`);
      logger.info(`[Webhook] PayPal: $${amount} acreditado a user #${userId}`);
    } catch (err) {
      logger.error(`[Webhook] PayPal: error acreditando user #${userId}: ${err.message}`);
    }
  }
  return res.status(200).json({ received: true });
};

/* ─── Mercado Pago ────────────────────────────────────────────── */
const handleMercadoPago = async (req, res) => {
  const signature = req.headers['x-signature'];
  if (signature) {
    const valid = verifyMercadoPago(req.body, signature);
    if (!valid) return res.status(400).json({ error: 'Firma inválida' });
  }
  const event = req.body;
  logger.info(`[Webhook] MP event: ${event.action} (${event.id})`);
  if (event.action === 'payment.updated' && event.data?.id) {
    try {
      const { MercadoPagoConfig, Payment } = require('mercadopago');
      const client = new MercadoPagoConfig({ accessToken: env.MERCADO_PAGO_ACCESS_TOKEN });
      const payment = await new Payment(client).get({ id: event.data.id });
      if (payment.status === 'approved') {
        const userId = parseInt(payment.external_reference, 10);
        const amount = parseFloat(payment.transaction_amount);
        if (!userId || !amount || amount <= 0) return res.status(200).json({ received: true });
        await creditWallet(userId, amount, 'mercadopago', payment.id.toString(), `Depósito vía Mercado Pago (${payment.id})`);
        logger.info(`[Webhook] MP: $${amount} acreditado a user #${userId}`);
      }
    } catch (err) {
      logger.error(`[Webhook] MP: error procesando pago: ${err.message}`);
    }
  }
  return res.status(200).json({ received: true });
};

/* ─── Crypto (simplificado: usado por cryptoMonitor) ──────────── */
const confirmCryptoDeposit = async (depositId, userId, amount, txHash) => {
  try {
    await completeDepositRequest(depositId, txHash);
    await creditWallet(userId, amount, 'crypto', txHash, `Depósito vía Crypto (${txHash.slice(0, 12)}...)`);
    logger.info(`[Crypto] $${amount} acreditado a user #${userId} (tx: ${txHash.slice(0, 16)}...)`);
    return true;
  } catch (err) {
    logger.error(`[Crypto] error acreditando user #${userId}: ${err.message}`);
    return false;
  }
};

module.exports = { handlePayPal, handleMercadoPago, confirmCryptoDeposit };
