const db = require('../db');
const { generateUserId } = require('../utils/idGenerator');
const { getIO } = require('../utils/socket');
const { notifyNewOrder, notifyOrderCancelled } = require('../utils/mailer');
const { sendOrderEmail } = require('../utils/mailer');

const ORDER_STATUSES = [
  'Pending',
  'In Progress',
  'Sent for Packing',
  'Packed',
  'Out for Delivery',
  'Delivered',
  'Delivery Unsuccessful',
  'Cancelled',
];

const parseOrder = (row) => ({
  ...row,
  items: row.items ? JSON.parse(row.items) : [],
  statusHistory: row.statusHistory ? JSON.parse(row.statusHistory) : [],
  cancelledBy: row.cancelledBy || null,
});

// GET /api/orders/user/:userId — customer's personal order history
exports.getUserOrders = (req, res) => {
  const { userId } = req.params;
  try {
    const rows = db
      .prepare(
        `SELECT * FROM orders 
         WHERE userId = ? 
         ORDER BY orderDate DESC, orderTime DESC`
      )
      .all(userId);
    res.status(200).json(rows.map(parseOrder));
  } catch (err) {
    res.status(500).json({ message: 'Could not load user orders', error: err.message });
  }
};

// GET /api/orders — flat list for the admin Orders tab, joined with customer info
exports.getAllOrders = (req, res) => {
  try {
    const rows = db
      .prepare(
        `SELECT o.*, u.fullName AS customerName, u.email AS customerEmail, u.phone AS customerPhone
         FROM orders o
         LEFT JOIN users u ON u.id = o.userId
         ORDER BY o.orderDate DESC, o.orderTime DESC`
      )
      .all();
    res.status(200).json(rows.map(parseOrder));
  } catch (err) {
    res.status(500).json({ message: 'Could not load orders', error: err.message });
  }
};

// POST /api/orders — customer checkout
exports.createOrder = async (req, res) => {
  const { userId, items, totalAmount, shippingAddress, affiliateCode } = req.body;

  if (!items || items.length === 0 || !shippingAddress) {
    return res.status(400).json({ success: false, message: 'Invalid order payload.' });
  }

  try {
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const orderDate = new Date().toISOString().split('T')[0];
    const orderTime = new Date().toLocaleTimeString('en-US', { hour12: false });
    
    // 1. Calculate Product Subtotal & Commission
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.qty)), 0);
    let appliedCode = null;
    let commissionAmount = 0;

    if (affiliateCode) {
      // Find affiliate (case-insensitive lookup)
      const affiliate = db.prepare(`
        SELECT * FROM affiliates 
        WHERE UPPER(affiliateCode) = UPPER(?) AND status = 'Approved'
      `).get(affiliateCode);

      if (affiliate) {
        appliedCode = affiliate.affiliateCode;
        commissionAmount = Math.round(subtotal * 0.10); // 10% of subtotal

        // Credit the affiliate's balance in SQLite
        db.prepare(`
          UPDATE affiliates 
          SET balance = balance + ?, totalEarned = totalEarned + ? 
          WHERE id = ?
        `).run(commissionAmount, commissionAmount, affiliate.id);
      }
    }

    // 2. Initial status history
    const statusHistory = JSON.stringify([
      { status: 'Pending', at: new Date().toISOString() }
    ]);

    // 3. Save order to database
    const insert = db.prepare(`
      INSERT INTO orders (
        id, userId, orderDate, orderTime, orderStatus, 
        shippingAddress, totalAmount, items, statusHistory, 
        affiliateCode, affiliateCommission
      ) VALUES (?, ?, ?, ?, 'Pending', ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      orderId,
      userId || 'GUEST',
      orderDate,
      orderTime,
      shippingAddress,
      totalAmount,
      JSON.stringify(items),
      statusHistory,
      appliedCode,
      commissionAmount
    );

    // Fetch newly created order
    const newOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    newOrder.items = JSON.parse(newOrder.items || '[]');
    newOrder.statusHistory = JSON.parse(newOrder.statusHistory || '[]');

    // Broadcast realtime socket update to Admin Dashboard
    if (getIO()) {
      getIO().emit('order:created', newOrder);
    }

    // 4. Send Confirmation Email (Async)
    // Extract customer email from shippingAddress string or logged-in user
    let customerEmail = '';
    const emailMatch = shippingAddress.match(/Email:\s*([^\s,)]+)/i);
    if (emailMatch) {
      customerEmail = emailMatch[1];
    } else if (userId) {
      const u = db.prepare('SELECT email FROM users WHERE id = ?').get(userId);
      if (u) customerEmail = u.email;
    }

    if (customerEmail) {
      sendOrderEmail(customerEmail, newOrder).catch((err) => {
        console.error('Failed to send confirmation email:', err);
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: newOrder,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ success: false, message: 'Server error placing order', error: error.message });
  }
};
// PATCH /api/orders/:id/status — admin moves an order through the lifecycle
exports.updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status, cancelledBy } = req.body;

  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${ORDER_STATUSES.join(', ')}` });
  }

  const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ message: 'Order not found' });

  try {
    const history = existing.statusHistory ? JSON.parse(existing.statusHistory) : [];
    history.push({ status, at: new Date().toISOString() });

    // Determine cancelledBy value safely
    let newCancelledBy = existing.cancelledBy || null;
    if (status === 'Cancelled') {
      newCancelledBy = cancelledBy || 'admin';
    } else {
      newCancelledBy = null;
    }

    db.prepare('UPDATE orders SET orderStatus = ?, statusHistory = ?, cancelledBy = ? WHERE id = ?').run(
      status,
      JSON.stringify(history),
      newCancelledBy,
      id
    );

    // If newly cancelled, restock items and notify admins
    if (status === 'Cancelled' && existing.orderStatus !== 'Cancelled') {
      const items = existing.items ? JSON.parse(existing.items) : [];
      const restock = db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?');
      for (const item of items) {
        if (item.productId) restock.run(item.qty || 1, item.productId);
      }

      const customer = db.prepare('SELECT fullName, email, phone FROM users WHERE id = ?').get(existing.userId);
      const updatedOrder = parseOrder(db.prepare('SELECT * FROM orders WHERE id = ?').get(id));
      
      notifyOrderCancelled(updatedOrder, customer, newCancelledBy);
    }

    const order = parseOrder(db.prepare('SELECT * FROM orders WHERE id = ?').get(id));
    getIO().emit('order:statusUpdated', { id, orderStatus: status, statusHistory: history, cancelledBy: newCancelledBy });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Could not update order status', error: err.message });
  }
};

// POST /api/orders/:id/cancel — customer-initiated cancellation
exports.cancelOrder = (req, res) => {
  req.body = { status: 'Cancelled', cancelledBy: 'user' };
  exports.updateOrderStatus(req, res);
};

exports.ORDER_STATUSES = ORDER_STATUSES;