'use strict';

const { pool } = require('../config/db');
const logger = require('../utils/logger');
const env = require('../config/env');
const { confirmCryptoDeposit } = require('../controllers/webhookController');

const monitorInterval = env.CRYPTO_MONITOR_INTERVAL || 300000;

const monitoredAddresses = () => {
  const addr = env.CRYPTO_WALLET_ADDRESS;
  return addr ? [addr.trim()] : [];
};

const detectCryptoPayment = async () => {
  const addresses = monitoredAddresses();
  if (addresses.length === 0) return;
  try {
    const axios = require('axios');
    for (const address of addresses) {
      let txs = [];
      try {
        const { data } = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${address}`, { timeout: 10000 });
        txs = (data.txrefs || []).concat(data.unconfirmed_txrefs || []);
      } catch (_) {
        try {
          const { data } = await axios.get(`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&sort=desc&limit=5`, { timeout: 10000 });
          txs = (data.result || []).map(tx => ({ tx_hash: tx.hash, value: tx.value, confirmations: parseInt(tx.confirmations || 0) }));
        } catch (_2) { return; }
      }
      for (const tx of txs) {
        if (tx.confirmations < 2) continue;
        const txHash = tx.tx_hash || tx.hash;
        const value = parseFloat(tx.value) / 1e8;
        if (value <= 0) continue;
        const [pending] = await pool.query(
          `SELECT dr.id, dr.user_id, dr.amount FROM deposit_requests dr
           WHERE dr.status = 'pending' AND dr.method = 'crypto'
           AND ABS(dr.amount - ?) < 0.01
           AND (dr.external_ref IS NULL OR dr.external_ref = ?)
           LIMIT 1`,
          [value, txHash],
        );
        if (pending.length > 0) {
          await confirmCryptoDeposit(pending[0].id, pending[0].user_id, pending[0].amount, txHash);
        }
      }
    }
  } catch (err) {
    logger.error(`[CryptoMonitor] Error: ${err.message}`);
  }
};

let intervalId = null;
const start = () => {
  if (intervalId) return;
  logger.info(`[CryptoMonitor] Iniciado (cada ${monitorInterval / 1000}s)`);
  detectCryptoPayment();
  intervalId = setInterval(detectCryptoPayment, monitorInterval);
};

const stop = () => {
  if (intervalId) { clearInterval(intervalId); intervalId = null; }
};

module.exports = { start, stop };
