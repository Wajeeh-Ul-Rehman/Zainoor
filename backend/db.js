const Database = require('better-sqlite3');
const db = new Database('users.db');

db.pragma('foreign_keys = ON');

// Users Table (id is now TEXT)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,                              -- Change to TEXT
    fullName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    isAdmin INTEGER DEFAULT 0
  )
`);

// Orders Table (id and userId are now TEXT)
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,                              -- Change to TEXT
    userId TEXT NOT NULL,                             -- Change to TEXT to match users(id)
    orderDate TEXT DEFAULT (date('now', 'localtime')),
    orderTime TEXT DEFAULT (time('now', 'localtime')),
    orderStatus TEXT DEFAULT 'Pending',
    shippingAddress TEXT NOT NULL,
    totalAmount REAL NOT NULL,
    items TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// New: tracks every status change over time (e.g. Pending -> Packed -> Delivered),
// so both the admin dashboard and a future customer tracking view can show a timeline.
try {
  db.exec(`ALTER TABLE orders ADD COLUMN statusHistory TEXT DEFAULT '[]' `);
} catch (err) {
  // Already added on a previous run — safe to ignore.
}

// Inside backend/db.js
try {
  db.exec(`ALTER TABLE orders ADD COLUMN cancelledBy TEXT`);
} catch (err) {
  // Column already exists — safe to ignore
}

try {
  db.exec(`ALTER TABLE products ADD COLUMN sizeCharts TEXT DEFAULT '{}'`);
} catch (err) {
  // Already added on a previous run — safe to ignore.
}

// New: Products Table
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    cost REAL DEFAULT 0,
    stock INTEGER DEFAULT 0,
    category TEXT,
    images TEXT DEFAULT '[]',
    hidden INTEGER DEFAULT 0,
    unitsSold INTEGER DEFAULT 0,
    sale TEXT DEFAULT '{"active":false,"price":null,"unlimited":true,"startDate":null,"endDate":null}',
    createdAt TEXT DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )
`);

try {
  db.exec(`ALTER TABLE users ADD COLUMN resetCode TEXT`);
  db.exec(`ALTER TABLE users ADD COLUMN resetCodeExpiry INTEGER`);
} catch (err) {// Columns already exist — safe to ignore
}

module.exports = db;  