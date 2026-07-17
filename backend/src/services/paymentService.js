'use strict';

const env = require('../config/env');
const logger = require('../utils/logger');

const createPayPalOrder = async (amount, userId, depositId) => {
  const axios = require('axios');
  const auth = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const { data: token } = await axios.post(
    'https://api-m.paypal.com/v1/oauth2/token',
    'grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' } },
  );
  const { data: order } = await axios.post(
    'https://api-m.paypal.com/v2/checkout/orders',
    {
      intent: 'CAPTURE',
      purchase_units: [{ amount: { currency_code: 'USD', value: amount.toFixed(2) } }],
      custom_id: `${userId}:${depositId}`,
    },
    { headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' } },
  );
  logger.info(`[Payment] PayPal Order #${order.id} creado para user #${userId} ($${amount})`);
  return { id: order.id, status: order.status };
};

const capturePayPalOrder = async (paypalOrderId) => {
  const axios = require('axios');
  const auth = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const { data: token } = await axios.post(
    'https://api-m.paypal.com/v1/oauth2/token',
    'grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' } },
  );
  const { data: capture } = await axios.post(
    `https://api-m.paypal.com/v2/checkout/orders/${paypalOrderId}/capture`,
    {},
    { headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' } },
  );
  const status = capture.status;
  const customId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id || capture.purchase_units?.[0]?.custom_id || '';
  logger.info(`[Payment] PayPal Order #${paypalOrderId} capturado: ${status}`);
  return { status, customId };
};

module.exports = { createPayPalOrder, capturePayPalOrder };
