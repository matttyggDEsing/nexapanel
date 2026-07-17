'use strict';

const cron = require('node-cron');
const { pool } = require('../config/db');
const smm = require('./smmProvider');
const logger = require('../utils/logger');

const MIN_BALANCE_THRESHOLD = 10;
const CHECK_INTERVAL = '*/10 * * * *';

const alerts = [];

const checkBalances = async () => {
  try {
    const [providers] = await pool.query(
      'SELECT id, name, api_url, api_key, balance, status FROM providers WHERE status = ?',
      ['active'],
    );
    alerts.length = 0;
    for (const p of providers) {
      try {
        const data = await smm.getBalance(p.api_url, p.api_key);
        const currentBalance = parseFloat(data.balance || 0);
        await pool.query('UPDATE providers SET balance = ?, last_sync = NOW() WHERE id = ?', [currentBalance, p.id]);
        if (currentBalance < MIN_BALANCE_THRESHOLD) {
          alerts.push({
            provider_id: p.id,
            provider_name: p.name,
            balance: currentBalance,
            severity: currentBalance <= 0 ? 'critical' : 'warning',
            message: `Saldo bajo en ${p.name}: $${currentBalance.toFixed(2)}`,
          });
          logger.warn(`[BalanceMonitor] ${p.name} tiene saldo bajo: $${currentBalance}`);
        } else {
          logger.info(`[BalanceMonitor] ${p.name}: $${currentBalance}`);
        }
      } catch (err) {
        logger.warn(`[BalanceMonitor] Error consultando balance de ${p.name}: ${err.message}`);
        await pool.query('UPDATE providers SET status = ? WHERE id = ?', ['error', p.id]);
      }
    }
  } catch (err) {
    logger.error(`[BalanceMonitor] Error general: ${err.message}`);
  }
};

const getAlerts = () => [...alerts];

let task = null;
const start = () => {
  if (task) return;
  task = cron.schedule(CHECK_INTERVAL, checkBalances);
  logger.info(`[BalanceMonitor] Iniciado (cada 10 min, umbral: $${MIN_BALANCE_THRESHOLD})`);
  checkBalances();
};

const stop = () => {
  if (task) { task.stop(); task = null; }
};

module.exports = { start, stop, getAlerts, checkBalances };
