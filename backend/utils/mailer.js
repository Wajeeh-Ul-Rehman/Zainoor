const nodemailer = require('nodemailer');

// Comma-separated list in .env, e.g. ADMIN_NOTIFY_EMAILS=admin@zainoor.com,owner@zainoor.com
const ADMIN_EMAILS = (process.env.ADMIN_NOTIFY_EMAILS || '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function notifyAdmins(subject, html) {
  if (ADMIN_EMAILS.length === 0) {
    console.warn('ADMIN_NOTIFY_EMAILS is not set — skipping admin email:', subject);
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: ADMIN_EMAILS.join(','),
      subject,
      html,
    });
  } catch (err) {
    // Don't let a failed email break the order/cancel request itself
    console.error('Failed to send admin notification email:', err.message);
  }
}

module.exports = { notifyAdmins };