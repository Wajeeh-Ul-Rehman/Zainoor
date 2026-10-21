const db = require('../db');
const { generateUserId } = require('../utils/idGenerator');
const { getIO } = require('../utils/socket');

const parseProduct = (row) => {
  if (!row) return null;
  return {
    ...row,
    images: row.images ? JSON.parse(row.images) : [],
    sale: row.sale
      ? JSON.parse(row.sale)
      : { active: false, price: null, unlimited: true, startDate: null, endDate: null },
    sizeCharts: row.sizeCharts ? JSON.parse(row.sizeCharts) : {},
    hidden: !!row.hidden,
  };
};

// GET /api/products            -> only visible products (for storefront)
// GET /api/products?all=true   -> everything, including hidden (for admin)
exports.listProducts = (req, res) => {
  try {
    const includeHidden = req.query.all === 'true';
    const rows = includeHidden
      ? db.prepare('SELECT * FROM products ORDER BY createdAt DESC').all()
      : db.prepare('SELECT * FROM products WHERE hidden = 0 ORDER BY createdAt DESC').all();
    res.status(200).json(rows.map(parseProduct));
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not load products', error: err.message });
  }
};

exports.getProduct = (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json(parseProduct(row));
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.createProduct = (req, res) => {
  const { title, description, price, cost, stock, category, images, sizeCharts } = req.body;

  if (!title || price === undefined) {
    return res.status(400).json({ success: false, message: 'Title and price are required' });
  }

  try {
    const id = typeof generateUserId === 'function' ? generateUserId() : 'prod_' + Math.random().toString(36).substring(2, 9);
    
    const imagesStr = typeof images === 'string' ? images : JSON.stringify(images || []);
    const sizeChartsStr = typeof sizeCharts === 'string' ? sizeCharts : JSON.stringify(sizeCharts || {});

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
      imagesStr,
      sizeChartsStr
    );

    const newProductRow = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    const parsedProduct = parseProduct(newProductRow);

    getIO().emit('product:created', parsedProduct);

    res.status(201).json({ 
      success: true, 
      product: parsedProduct 
    });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ success: false, message: 'Could not create product', error: err.message });
  }
};

exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const { title, description, price, cost, stock, category, images, sizeCharts } = req.body;

  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const imagesStr = images !== undefined 
      ? (typeof images === 'string' ? images : JSON.stringify(images)) 
      : existing.images;
      
    const sizeChartsStr = sizeCharts !== undefined 
      ? (typeof sizeCharts === 'string' ? sizeCharts : JSON.stringify(sizeCharts)) 
      : existing.sizeCharts;

    const stmt = db.prepare(`
      UPDATE products 
      SET title = ?, description = ?, price = ?, cost = ?, stock = ?, category = ?, images = ?, sizeCharts = ?
      WHERE id = ?
    `);

    stmt.run(
      title || existing.title,
      description !== undefined ? description : existing.description,
      price !== undefined ? price : existing.price,
      cost !== undefined ? cost : existing.cost,
      stock !== undefined ? stock : existing.stock,
      category !== undefined ? category : existing.category,
      imagesStr,
      sizeChartsStr,
      id
    );

    const updatedRow = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    const parsedProduct = parseProduct(updatedRow);

    getIO().emit('product:updated', parsedProduct);

    res.status(200).json({ 
      success: true, 
      product: parsedProduct 
    });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ success: false, message: 'Could not update product', error: err.message });
  }
};

exports.deleteProduct = (req, res) => {
  const { id } = req.params;
  try {
    const info = db.prepare('DELETE FROM products WHERE id = ?').run(id);
    if (info.changes === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    getIO().emit('product:deleted', { id });
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not delete product', error: err.message });
  }
};

exports.toggleHide = (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });

  try {
    const newHidden = existing.hidden ? 0 : 1;
    db.prepare('UPDATE products SET hidden = ? WHERE id = ?').run(newHidden, id);
    const product = parseProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(id));
    getIO().emit('product:updated', product);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not update product', error: err.message });
  }
};

exports.setSale = (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });

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
    res.status(500).json({ success: false, message: 'Could not update sale', error: err.message });
  }
};

// POST /api/products/upload — multipart form, field name "images", up to 10 files.
exports.uploadImages = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No images uploaded' });
  }
  const urls = req.files.map((f) => `/uploads/products/${f.filename}`);
  res.status(200).json({ urls });
};