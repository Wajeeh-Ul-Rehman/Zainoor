const db = require('../db');
const { generateUserId } = require('../utils/idGenerator');
const { getIO } = require('../utils/socket');
const { notifyAdmins } = require('../utils/mailer');

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
});

// GET /api/orders — flat list for the admin Orders tab, joined with customer info
exports.getAllOrders = (req, res) => {
  try {
    const rows = db
      .prepare(
        `SELECT o.*, u.fullName AS customerName, u.email AS customerEmail
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
exports.createOrder = (req, res) => {
  const { userId, items, totalAmount, shippingAddress } = req.body;
  if (!userId || !Array.isArray(items) || items.length === 0 || !totalAmount || !shippingAddress) {
    return res.status(400).json({ message: 'userId, items, totalAmount, and shippingAddress are required' });
  }

  try {
    const id = generateUserId();
    const now = new Date();
    const orderDate = now.toISOString().slice(0, 10);
    const orderTime = now.toTimeString().slice(0, 8);
    const statusHistory = JSON.stringify([{ status: 'Pending', at: now.toISOString() }]);

    db.prepare(
      `INSERT INTO orders (id, userId, orderDate, orderTime, orderStatus, shippingAddress, totalAmount, items, statusHistory)
       VALUES (?, ?, ?, ?, 'Pending', ?, ?, ?, ?)`
    ).run(id, userId, orderDate, orderTime, shippingAddress, totalAmount, JSON.stringify(items), statusHistory);

    // Best-effort stock decrement — a missing/blank productId on a line item is skipped, not fatal
    const decrementStock = db.prepare(
      'UPDATE products SET stock = MAX(stock - ?, 0), unitsSold = unitsSold + ? WHERE id = ?'
    );
    for (const item of items) {
      if (item.productId) decrementStock.run(item.qty || 1, item.qty || 1, item.productId);
    }

    const user = db.prepare('SELECT fullName, email FROM users WHERE id = ?').get(userId);
    const order = parseOrder({
      ...db.prepare('SELECT * FROM orders WHERE id = ?').get(id),
      customerName: user?.fullName,
      customerEmail: user?.email,
    });

    getIO().emit('order:created', order);

    notifyAdmins(
      `New order ${id} — Rs ${totalAmount}`,
      `<p><strong>${user?.fullName || 'A customer'}</strong> (${user?.email || userId}) just placed an order.</p>
       <p><strong>Order ID:</strong> ${id}<br/>
       <strong>Total:</strong> Rs ${totalAmount}<br/>
       <strong>Shipping to:</strong> ${shippingAddress}</p>`
    );

    res.status(201).json({ message: 'Order placed', order });
  } catch (err) {
    res.status(500).json({ message: 'Could not create order', error: err.message });
  }
};

// PATCH /api/orders/:id/status — admin moves an order through the lifecycle
exports.updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${ORDER_STATUSES.join(', ')}` });
  }

  const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ message: 'Order not found' });

  try {
    const history = existing.statusHistory ? JSON.parse(existing.statusHistory) : [];
    history.push({ status, at: new Date().toISOString() });

    db.prepare('UPDATE orders SET orderStatus = ?, statusHistory = ? WHERE id = ?').run(
      status,
      JSON.stringify(history),
      id
    );

    // Only restock + email once, on the transition INTO Cancelled
    if (status === 'Cancelled' && existing.orderStatus !== 'Cancelled') {
      const items = existing.items ? JSON.parse(existing.items) : [];
      const restock = db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?');
      for (const item of items) {
        if (item.productId) restock.run(item.qty || 1, item.productId);
      }

      const user = db.prepare('SELECT fullName, email FROM users WHERE id = ?').get(existing.userId);
      notifyAdmins(
        `Order ${id} cancelled`,
        `<p>Order <strong>${id}</strong> for ${user?.fullName || existing.userId} (${user?.email || ''}) was cancelled.</p>`
      );
    }

    const order = parseOrder(db.prepare('SELECT * FROM orders WHERE id = ?').get(id));
    getIO().emit('order:statusUpdated', { id, orderStatus: status, statusHistory: history });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Could not update order status', error: err.message });
  }
};

// POST /api/orders/:id/cancel — customer-initiated cancellation.
// Kept as its own endpoint (rather than requiring the customer to call the
// admin-style status route) so you can apply different auth rules to each later.
exports.cancelOrder = (req, res) => {
  req.body = { status: 'Cancelled' };
  exports.updateOrderStatus(req, res);
};

exports.ORDER_STATUSES = ORDER_STATUSES;