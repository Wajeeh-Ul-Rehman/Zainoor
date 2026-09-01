const nodemailer = require('nodemailer');

const ADMIN_EMAILS = (process.env.ADMIN_NOTIFY_EMAILS || 'abdullahwajeeh074@gmail.com,support@zainoor.com.pk')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
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
    console.error('Failed to send admin notification email:', err.message);
  }
}

async function notifyNewUser(user) {
  const now = new Date();
  const html = `
    <h2>New User Registration</h2>
    <p><strong>Name:</strong> ${user.fullName || user.name}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Method of Sign Up:</strong> Password / Standard</p>
    <p><strong>Phone Number:</strong> ${user.phone || 'N/A'}</p>
    <p><strong>Date & Time:</strong> ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}</p>
  `;
  await notifyAdmins(`New User Registration — ${user.fullName || user.name}`, html);
}

async function notifyNewOrder(order, user) {
  const itemsListHtml = (order.items || []).map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.qty}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">Rs. ${(item.price || 0).toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <h2>New Order Notification</h2>
    <p><strong>Order ID:</strong> ${order.id}</p>
    <p><strong>Status:</strong> ${order.orderStatus || 'Pending'}</p>
    <p><strong>Date & Time:</strong> ${order.orderDate} at ${order.orderTime}</p>
    <p><strong>Total Price:</strong> Rs. ${Number(order.totalAmount || 0).toLocaleString()}</p>
    <p><strong>Customer Name:</strong> ${user?.fullName || user?.name || 'N/A'}</p>
    <p><strong>Email:</strong> ${user?.email || 'N/A'}</p>
    <p><strong>Contact Number / Phone:</strong> ${user?.phone || 'N/A'}</p>
    <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
    
    <h3 style="margin-top: 20px;">Ordered Products:</h3>
    <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 14px;">
      <thead>
        <tr style="background: #f4f4f4; text-align: left;">
          <th style="padding: 8px;">Product Name</th>
          <th style="padding: 8px; text-align: center;">Quantity</th>
          <th style="padding: 8px; text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsListHtml}
      </tbody>
    </table>
  `;
  await notifyAdmins(`New Order Placed [${order.id}] — Rs. ${Number(order.totalAmount || 0).toLocaleString()}`, html);
}

async function notifyOrderCancelled(order, user, cancelledBy) {
  const itemsListHtml = (order.items || []).map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.qty}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">Rs. ${(item.price || 0).toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <h2>Order Cancellation Notice</h2>
    <p><strong>Order ID:</strong> ${order.id}</p>
    <p><strong>Cancelled By:</strong> ${cancelledBy === 'user' ? 'Customer' : 'Admin'}</p>
    <p><strong>Status:</strong> Cancelled</p>
    <p><strong>Date & Time:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Total Amount:</strong> Rs. ${Number(order.totalAmount || 0).toLocaleString()}</p>
    <p><strong>Customer Name:</strong> ${user?.fullName || user?.name || 'N/A'}</p>
    <p><strong>Email:</strong> ${user?.email || 'N/A'}</p>
    <p><strong>Contact Number:</strong> ${user?.phone || 'N/A'}</p>
    <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>

    <h3 style="margin-top: 20px;">Order Items:</h3>
    <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 14px;">
      <thead>
        <tr style="background: #f4f4f4; text-align: left;">
          <th style="padding: 8px;">Product Name</th>
          <th style="padding: 8px; text-align: center;">Quantity</th>
          <th style="padding: 8px; text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsListHtml}
      </tbody>
    </table>
  `;
  await notifyAdmins(`Order Cancelled [${order.id}] by ${cancelledBy.toUpperCase()}`, html);
}

async function notifyNewSubmission(sub) {
  const html = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${sub.name}</p>
    <p><strong>Email:</strong> ${sub.email}</p>
    <p><strong>Subject:</strong> ${sub.subject}</p>
    <p><strong>Date & Time:</strong> ${new Date(sub.createdAt).toLocaleString()}</p>
    <h3 style="margin-top: 15px;">Message:</h3>
    <p style="background: #f9f9f9; padding: 12px; border-left: 3px solid #000; font-family: sans-serif;">${sub.message.replace(/\n/g, '<br/>')}</p>
  `;
  await notifyAdmins(`New Contact Inquiry: [${sub.subject}] — ${sub.name}`, html);
}

async function sendUserEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"Zainoor Support" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Failed to send user email:', err.message);
  }
}

async function sendPasswordResetCode(email, code) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #000;">Password Reset Code</h2>
      <p>You requested a password reset for your Zainoor account. Here is your 5-digit code:</p>
      <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
        <strong style="font-size: 32px; letter-spacing: 4px; color: #000;">${code}</strong>
      </div>
      <p style="color: #666; font-size: 14px;">This code will expire in 15 minutes.</p>
      <p style="color: #666; font-size: 14px;">If you did not request this, please ignore this email.</p>
    </div>
  `;
  await sendUserEmail(email, 'Your Zainoor Password Reset Code', html);
}


module.exports = {notifyAdmins, notifyNewUser, notifyNewOrder, notifyOrderCancelled, notifyNewSubmission, sendPasswordResetCode };