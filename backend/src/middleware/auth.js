const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { errorResponse } = require('../utils/response');
const env = require('../config/env');

/**
 * Verifica un token JWT y devuelve el payload decodificado, o null si es inválido.
 */
const verifyToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.slice(7), env.JWT_SECRET);
  } catch {
    return null;
  }
};

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const decoded = verifyToken(authHeader);
    if (!decoded) {
      return errorResponse(res, 'Token de autenticación requerido', 401);
    }

    const [rows] = await pool.query(
      'SELECT id, role, email, balance, status FROM users WHERE id = ? LIMIT 1',
      [decoded.id],
    );

    if (!rows.length) {
      return errorResponse(res, 'Usuario no encontrado', 401);
    }

    const user = rows[0];

    if (user.status === 'banned') {
      return errorResponse(res, 'Cuenta suspendida. Contacta soporte.', 403);
    }

    req.user = {
      id:      user.id,
      role:    user.role,
      email:   user.email,
      balance: user.balance,
    };

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = auth;
module.exports.verifyToken = verifyToken;






