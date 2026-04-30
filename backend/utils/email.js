const nodemailer = require('nodemailer');

// Only send emails when SMTP credentials are configured
const isConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

/**
 * Send an email. Silently skips if SMTP is not configured.
 * @param {string} to - recipient email
 * @param {string} subject
 * @param {string} html - HTML body
 */
async function sendEmail(to, subject, html) {
  if (!isConfigured) return; // graceful no-op in dev without SMTP
  try {
    await transporter.sendMail({
      from: `"Acadex" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('[email] Failed to send to', to, ':', err.message);
  }
}

module.exports = { sendEmail };
