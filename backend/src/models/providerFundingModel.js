const { pool } = require('../config/db');

const create = async ({ provider_id, amount, balance_before, balance_after, method, reference, notes }) => {
  const [result] = await pool.query(
    `INSERT INTO provider_funding
       (provider_id, amount, balance_before, balance_after, method, reference, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [provider_id, amount, balance_before, balance_after, method || 'manual', reference || null, notes || null],
  );
  return result.insertId;
};

const findByProvider = async (providerId, { limit, offset }) => {
  const [rows] = await pool.query(
    `SELECT * FROM provider_funding
     WHERE provider_id = ?
     ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [providerId, limit, offset],
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM provider_funding WHERE provider_id = ?`,
    [providerId],
  );
  return { rows, total };
};

const getProviderTotals = async (providerId) => {
  const [[row]] = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS total_funded
     FROM provider_funding WHERE provider_id = ?`,
    [providerId],
  );
  return row ? parseFloat(row.total_funded) : 0;
};

const getAllTotals = async () => {
  const [rows] = await pool.query(
    `SELECT pf.provider_id, p.name AS provider_name,
            COALESCE(SUM(pf.amount), 0) AS total_funded
     FROM provider_funding pf
     JOIN providers p ON p.id = pf.provider_id
     GROUP BY pf.provider_id, p.name
     ORDER BY p.name`,
  );
  return rows.map(r => ({ ...r, total_funded: parseFloat(r.total_funded) }));
};

module.exports = { create, findByProvider, getProviderTotals, getAllTotals };