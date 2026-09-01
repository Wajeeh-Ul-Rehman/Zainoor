const db = require('../db');
const { generateUserId } = require('../utils/idGenerator'); // same 6-char generator used for users
const { getIO } = require('../utils/socket');

const parseProduct = (row) => ({
  ...row,
  images: row.images ? JSON.parse(row.images) : [],
  sale: row.sale
    ? JSON.parse(row.sale)
    : { active: false, price: null, unlimited: true, startDate: null, endDate: null },
  hidden: !!row.hidden,
});

// GET /api/products            -> only visible products (for the storefront)
// GET /api/products?all=true   -> everything, including hidden (for the admin dashboard)
exports.listProducts = (req, res) => {
  try {
    const includeHidden = req.query.all === 'true';
    const rows = includeHidden
      ? db.prepare('SELECT * FROM products ORDER BY createdAt DESC').all()
      : db.prepare('SELECT * FROM products WHERE hidden = 0 ORDER BY createdAt DESC').all();
    res.status(200).json(rows.map(parseProduct));
  } catch (err) {
    res.status(500).json({ message: 'Could not load products', error: err.message });
  }
};

exports.getProduct = (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(parseProduct(row));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// backend/controllers/productController.js (or product routes file)

exports.createProduct = (req, res) => {
  const { title, description, price, cost, stock, category, images, sizeCharts } = req.body;

  try {
    const id = 'prod_' + Math.random().toString(36).substring(2, 9);
    
    const stmt = db.prepare(`
      INSERT INTO products (id, title, description, price, cost, stock, category, images, sizeCharts)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      title,
      description || '',
      price,
      cost || 0,
      stock || 0,
      category || 'General',
      JSON.stringify(images || []),
      JSON.stringify(sizeCharts || {}) // <-- Stringify object for SQLite TEXT column
    );

    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.status(201).json({ 
      success: true, 
      product: { 
        ...newProduct, 
        images: JSON.parse(newProduct.images || '[]'), 
        sizeCharts: JSON.parse(newProduct.sizeCharts || '{}') 
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not create product', error: err.message });
  }
};

exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const { title, description, price, cost, stock, category, images, sizeCharts } = req.body;

  try {
    const stmt = db.prepare(`
      UPDATE products 
      SET title = ?, description = ?, price = ?, cost = ?, stock = ?, category = ?, images = ?, sizeCharts = ?
      WHERE id = ?
    `);

    stmt.run(
      title,
      description || '',
      price,
      cost || 0,
      stock || 0,
      category || 'General',
      JSON.stringify(images || []),
      JSON.stringify(sizeCharts || {}), // <-- Stringify object for SQLite TEXT column
      id
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.status(200).json({ 
      success: true, 
      product: { 
        ...updated, 
        images: JSON.parse(updated.images || '[]'), 
        sizeCharts: JSON.parse(updated.sizeCharts || '{}') 
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not update product', error: err.message });
  }
};

exports.deleteProduct = (req, res) => {
  const { id } = req.params;

  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    
    // Broadcast the deletion (only sending the ID is necessary)
    getIO().emit('product:deleted', id); 
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete product', error: err.message });
  }
};

exports.deleteProduct = (req, res) => {
  const { id } = req.params;
  try {
    const info = db.prepare('DELETE FROM products WHERE id = ?').run(id);
    if (info.changes === 0) return res.status(404).json({ message: 'Product not found' });
    getIO().emit('product:deleted', { id });
    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete product', error: err.message });
  }
};

exports.toggleHide = (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ message: 'Product not found' });

  try {
    const newHidden = existing.hidden ? 0 : 1;
    db.prepare('UPDATE products SET hidden = ? WHERE id = ?').run(newHidden, id);
    const product = parseProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(id));
    getIO().emit('product:updated', product);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Could not update product', error: err.message });
  }
};

exports.setSale = (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ message: 'Product not found' });

  const { active, price, unlimited, startDate, endDate } = req.body;
  try {
    const sale = JSON.stringify({
      active: !!active,
      price: price ?? null,
      unlimited: unlimited !== false,
      startDate: startDate || null,
      endDate: endDate || null,
    });
    db.prepare('UPDATE products SET sale = ? WHERE id = ?').run(sale, id);
    const product = parseProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(id));
    getIO().emit('product:updated', product);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Could not update sale', error: err.message });
  }
};

// POST /api/products/upload — multipart form, field name "images", up to 10 files.
// Returns URLs; call this first, then pass the returned urls[] into create/update.
exports.uploadImages = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No images uploaded' });
  }
  const urls = req.files.map((f) => `/uploads/products/${f.filename}`);
  res.status(200).json({ urls });
};