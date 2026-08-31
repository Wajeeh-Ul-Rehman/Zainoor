require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const createAdmin = (email, password, fullName) => { // Changed 'name' to 'fullName'
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  // 1. Delete the user if they already exist from previous testing
  db.prepare('DELETE FROM users WHERE email = ?').run(email);

  // 2. Insert the fresh admin user
  const stmt = db.prepare(`
    INSERT INTO users (id, email, password, fullName, isAdmin) 
    VALUES (?, ?, ?, ?, 1)
  `);
  
  stmt.run(uuidv4(), email, hashedPassword, fullName);
  console.log(`Admin user ${email} seeded successfully.`);
};

// Use the passwords from your .env file
createAdmin('abdullahwajeeh074@gmail.com', process.env.ADMIN1_PASSWORD, 'Abdullah Wajeeh');
createAdmin('support@zainoor.com.pk', process.env.ADMIN2_PASSWORD, 'Zainoor Support');