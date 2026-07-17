'use strict';

const crypto = require('crypto');
const env = require('../config/env');
const logger = require('./logger');

const verifyPayPal = async (headers, body) => {
  try {
    const axios = require('axios');
    const auth = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    const { data: tokenData } = await axios.post(
      'https://api-m.paypal.com/v1/oauth2/token',
      'grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' } },
    );
    const verification = await axios.post(
      'https://api-m.paypal.com/v1/notifications/verify-webhook-signature',
      {
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: env.PAYPAL_WEBHOOK_ID,
        webhook_event: body,
      },
      { headers: { Authorization: `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' } },
    );
    return verification.data.verification_status === 'SUCCESS';
  } catch (err) {
    logger.warn(`[Webhook] PayPal verification falló: ${err.message}`);
    return false;
  }
};

const verifyMercadoPago = (body, signature) => {
  try {
    if (!env.MERCADO_PAGO_WEBHOOK_SECRET) return false;
    const parts = (signature || '').split(',');
    let ts = '';
    let hash = '';
    for (const p of parts) {
      const [k, v] = p.trim().split('=');
      if (k === 'ts') ts = v;
      if (k === 'v1') hash = v;
    }
    if (!ts || !hash) return false;
    const manifest = `id:${body.data?.id};request-id:${body.id};ts:${ts};`;
    const computed = crypto.createHmac('sha256', env.MERCADO_PAGO_WEBHOOK_SECRET).update(manifest).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
  } catch (err) {
    logger.warn(`[Webhook] Mercado Pago signature inválida: ${err.message}`);
    return false;
  }
};

module.exports = { verifyPayPal, verifyMercadoPago };
