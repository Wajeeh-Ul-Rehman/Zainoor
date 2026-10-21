const express = require('express');
const router = express.Router();
const db = require('../db'); // Make sure this file is exactly in the routes/ folder

const AFFILIATE_STATUSES = ['Pending', 'Approved', 'Rejected', 'Suspended'];

// Helper to generate a unique 6-digit code safely
function generate6DigitCode() {
  let code;
  let isUnique = false;
  while (!isUnique) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    const existing = db.prepare('SELECT id FROM affiliates WHERE affiliateCode = ?').get(code);
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
}

// POST /api/affiliate/apply — User submits affiliate application
router.post('/apply', (req, res) => {
  try {
    const { 
      userId, fullName, phone, cnic, bankName, 
      bankHolderName, bankAccountNumber, socialHandle, reason 
    } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please log in first.' });
    }

    const user = db.prepare('SELECT email FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const existingAffiliate = db.prepare('SELECT * FROM affiliates WHERE userId = ?').get(userId);
    if (existingAffiliate) {
      return res.status(200).json({
        success: true,
        alreadyApplied: true,
        affiliateCode: existingAffiliate.affiliateCode,
        message: 'You have already applied.'
      });
    }

    if (!fullName || !phone || !cnic || !bankName || !bankHolderName || !bankAccountNumber || !reason) {
      return res.status(400).json({ success: false, message: 'Please fill out all required fields.' });
    }

    const affiliateCode = generate6DigitCode();
    // Using native string generation instead of 'uuid' to prevent package missing crashes
    const id = 'aff_' + Math.random().toString(36).substring(2, 15);

    const insert = db.prepare(`
      INSERT INTO affiliates (
        id, userId, fullName, email, phone, cnic, 
        bankName, bankHolderName, bankAccountNumber, 
        socialHandle, reason, affiliateCode, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved')
    `);

    insert.run(
      id, userId, fullName, user.email, phone, cnic,
      bankName, bankHolderName, bankAccountNumber,
      socialHandle || '', reason, affiliateCode
    );

    return res.status(201).json({
      success: true,
      message: `Successfully verified! Here is your 6 digit code: ${affiliateCode}`,
      affiliateCode
    });
  } catch (error) {
    console.error('Affiliate submission error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Database error occurred.' });
  }
});

// GET /api/affiliate — Admin List
router.get('/', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT a.*, u.fullName AS accountName, u.email AS accountEmail
      FROM affiliates a
      LEFT JOIN users u ON u.id = a.userId
      ORDER BY a.createdAt DESC
    `).all();
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not load affiliates', error: err.message });
  }
});

// GET /api/affiliate/user/:userId — User Details
router.get('/user/:userId', (req, res) => {
  try {
    const affiliate = db.prepare('SELECT * FROM affiliates WHERE userId = ?').get(req.params.userId);
    if (!affiliate) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json(affiliate);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching details', error: err.message });
  }
});

// POST /api/affiliate/validate — Checkout Validation
router.post('/validate', (req, res) => {
  try {
    const affiliate = db.prepare("SELECT id FROM affiliates WHERE affiliateCode = ? AND status = 'Approved'").get(req.body.code);
    if (affiliate) return res.status(200).json({ success: true, code: req.body.code });
    return res.status(404).json({ success: false, message: 'Invalid or inactive affiliate code.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Validation error', error: err.message });
  }
});

// POST /api/affiliate/withdraw — User Withdrawal
router.post('/withdraw', (req, res) => {
  try {
    const { userId, amount } = req.body;
    const affiliate = db.prepare("SELECT * FROM affiliates WHERE userId = ?").get(userId);
    
    if (!affiliate) return res.status(404).json({ success: false, message: 'Affiliate not found.' });
    if (affiliate.balance < 2000) return res.status(400).json({ success: false, message: 'Minimum PKR 2,000 required.' });
    if (amount > affiliate.balance) return res.status(400).json({ success: false, message: 'Insufficient balance.' });

    const id = 'wd_' + Math.random().toString(36).substring(2, 15);
    db.prepare("INSERT INTO withdrawals (id, affiliateId, amount) VALUES (?, ?, ?)").run(id, affiliate.id, amount);
    db.prepare("UPDATE affiliates SET balance = balance - ? WHERE id = ?").run(amount, affiliate.id);
    
    res.status(200).json({ success: true, message: 'Withdrawal requested successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Withdrawal error', error: err.message });
  }
});

// PATCH /api/affiliate/:id/status — Admin Update
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!AFFILIATE_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    db.prepare('UPDATE affiliates SET status = ? WHERE id = ?').run(status, req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Status error', error: err.message });
  }
});

module.exports = router;