const Database = require('better-sqlite3');
const db = new Database('users.db');

db.pragma('foreign_keys = ON');

// Users Table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    isAdmin INTEGER DEFAULT 0
  )
`);

// Products Table 
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
    sizeCharts TEXT DEFAULT '{}',
    hidden INTEGER DEFAULT 0,
    unitsSold INTEGER DEFAULT 0,
    sale TEXT DEFAULT '{"active":false,"price":null,"unlimited":true,"startDate":null,"endDate":null}',
    createdAt TEXT DEFAULT (datetime('now'))
  )
`);

try {
  db.exec(`ALTER TABLE products ADD COLUMN sizeCharts TEXT DEFAULT '{}'`);
} catch (err) {}

// Orders Table
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    orderDate TEXT DEFAULT (date('now', 'localtime')),
    orderTime TEXT DEFAULT (time('now', 'localtime')),
    orderStatus TEXT DEFAULT 'Pending',
    shippingAddress TEXT NOT NULL,
    totalAmount REAL NOT NULL,
    items TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )
`);

try {
  db.exec(`ALTER TABLE orders ADD COLUMN statusHistory TEXT DEFAULT '[]'`);
  db.exec(`ALTER TABLE orders ADD COLUMN cancelledBy TEXT`);
  db.exec(`ALTER TABLE users ADD COLUMN resetCode TEXT`);
  db.exec(`ALTER TABLE users ADD COLUMN resetCodeExpiry INTEGER`);
} catch (err) {}

// Submissions Table
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

// Affiliates Table
db.exec(`
  CREATE TABLE IF NOT EXISTS affiliates (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL UNIQUE,
    fullName TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    cnic TEXT NOT NULL,
    bankName TEXT NOT NULL,
    bankHolderName TEXT NOT NULL,
    bankAccountNumber TEXT NOT NULL,
    socialHandle TEXT,
    reason TEXT NOT NULL,
    affiliateCode TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'Approved',
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Affiliate Commission Tracking
try {
  db.exec(`ALTER TABLE orders ADD COLUMN affiliateCode TEXT`);
  db.exec(`ALTER TABLE orders ADD COLUMN affiliateCommission REAL DEFAULT 0`);
  db.exec(`ALTER TABLE affiliates ADD COLUMN balance REAL DEFAULT 0`);
  db.exec(`ALTER TABLE affiliates ADD COLUMN totalEarned REAL DEFAULT 0`);
} catch (err) {}

// Withdrawals Table
db.exec(`
  CREATE TABLE IF NOT EXISTS withdrawals (
    id TEXT PRIMARY KEY,
    affiliateId TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'Pending',
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (affiliateId) REFERENCES affiliates(id) ON DELETE CASCADE
  )
`);

module.exports = db;