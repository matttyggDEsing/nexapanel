const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');

let transporter = null;

const getTransporter = () => {
  if (!transporter && env.MAIL_HOST && env.MAIL_USER) {
    transporter = nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      secure: env.MAIL_PORT === 465,
      auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASS,
      },
    });
  }
  return transporter;
};

const sendMail = async ({ to, subject, html }) => {
  const t = getTransporter();
  if (!t) {
    logger.warn('[Mailer] Email no configurado. Skipping send.');
    return;
  }
  try {
    await t.sendMail({ from: env.MAIL_FROM, to, subject, html });
    logger.info(`[Mailer] Email enviado a ${to}`);
  } catch (err) {
    logger.error(`[Mailer] Error enviando email: ${err.message}`);
  }
};

const sendWelcome = (user) =>
  sendMail({
    to: user.email,
    subject: 'Bienvenido a NexaPanel',
    html: `
      <h2>¡Hola, ${user.name}!</h2>
      <p>Tu cuenta en <strong>NexaPanel</strong> ha sido creada exitosamente.</p>
      <p>Tu API key: <code>${user.api_key}</code></p>
      <p>Guárdala en un lugar seguro.</p>
    `,
  });

const sendOrderStatus = (user, order) =>
  sendMail({
    to: user.email,
    subject: `Orden #${order.id} — ${order.status}`,
    html: `
      <p>Tu orden <strong>#${order.id}</strong> ha cambiado a estado: <strong>${order.status}</strong>.</p>
    `,
  });

const sendVerificationEmail = (user, token) => {
  const verifyUrl = `${env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  return sendMail({
    to: user.email,
    subject: 'Verifica tu email — NexaPanel',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>¡Hola, ${user.name}!</h2>
        <p>Gracias por registrarte en <strong>NexaPanel</strong>.</p>
        <p>Hacé clic en el siguiente botón para verificar tu email:</p>
        <a href="${verifyUrl}"
           style="display:inline-block;padding:12px 28px;margin:20px 0;border-radius:8px;
                  background:#10B981;color:#000;text-decoration:none;font-weight:bold;">
          Verificar email
        </a>
        <p style="color:#888;font-size:13px">O copiá este link en tu navegador:</p>
        <p style="color:#888;font-size:12px;word-break:break-all">${verifyUrl}</p>
        <p style="color:#888;font-size:13px">Si no creaste una cuenta, ignorá este mensaje.</p>
      </div>
    `,
  });
};

module.exports = { sendWelcome, sendOrderStatus, sendVerificationEmail };






