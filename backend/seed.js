require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const createAdmin = (email, password, name) => {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO users (id, email, password, name, isAdmin) 
    VALUES (?, ?, ?, ?, 1)
  `);
  stmt.run(uuidv4(), email, hashedPassword, name);
  console.log(`Admin user ${email} seeded.`);
};

// Use the passwords from your .env file
createAdmin('abdullahwajeeh074@gmail.com', process.env.ADMIN1_PASSWORD, 'Abdullah Wajeeh');
createAdmin('support@zainoor.com.pk', process.env.ADMIN2_PASSWORD, 'Zainoor Support');