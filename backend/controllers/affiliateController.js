const db = require('../db');
const { generateUserId } = require('../utils/idGenerator');

const AFFILIATE_STATUSES = ['Pending', 'Approved', 'Rejected', 'Suspended'];

// Helper to generate a unique 6-digit affiliate code
const generate6DigitCode = () => {
  let code;
  let isUnique = false;

  while (!isUnique) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    const existing = db
      .prepare('SELECT id FROM affiliates WHERE affiliateCode = ?')
      .get(code);
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
};

// GET /api/affiliate/user/:userId — fetch affiliate status & details for a specific user
exports.getAffiliateByUserId = (req, res) => {
  const { userId } = req.params;
  try {
    const affiliate = db
      .prepare('SELECT * FROM affiliates WHERE userId = ?')
      .get(userId);

    if (!affiliate) {
      return res.status(404).json({ message: 'No affiliate record found for this user' });
    }

    res.status(200).json(affiliate);
  } catch (err) {
    res.status(500).json({ message: 'Could not load affiliate details', error: err.message });
  }
};

// GET /api/affiliate — list all affiliate applications for the admin dashboard
exports.getAllAffiliates = (req, res) => {
  try {
    const rows = db
      .prepare(
        `SELECT a.*, u.fullName AS accountName, u.email AS accountEmail
         FROM affiliates a
         LEFT JOIN users u ON u.id = a.userId
         ORDER BY a.createdAt DESC`
      )
      .all();
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Could not load affiliates list', error: err.message });
  }
};

// POST /api/affiliate/apply — user submits affiliate application
exports.applyAffiliate = (req, res) => {
  const {
    userId,
    fullName,
    email,
    phone,
    cnic,
    bankName,
    bankHolderName,
    bankAccountNumber,
    socialHandle,
    reason,
  } = req.body;

  if (
    !userId ||
    !fullName ||
    !email ||
    !phone ||
    !cnic ||
    !bankName ||
    !bankHolderName ||
    !bankAccountNumber ||
    !reason
  ) {
    return res.status(400).json({ message: 'All required fields must be provided' });
  }

  try {
    // Check if user has already applied
    const existing = db
      .prepare('SELECT * FROM affiliates WHERE userId = ?')
      .get(userId);

    if (existing) {
      return res.status(200).json({
        message: 'Successfully verified! You are already eligible for our affiliate program.',
        alreadyApplied: true,
        affiliateCode: existing.affiliateCode,
        affiliate: existing,
      });
    }

    // Verify user exists
    const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    const id = generateUserId();
    const affiliateCode = generate6DigitCode();

    db.prepare(
      `INSERT INTO affiliates (
        id, userId, fullName, email, phone, cnic, 
        bankName, bankHolderName, bankAccountNumber, 
        socialHandle, reason, affiliateCode, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved')`
    ).run(
      id,
      userId,
      fullName,
      user.email, // Lock email to authenticated account email
      phone,
      cnic,
      bankName,
      bankHolderName,
      bankAccountNumber,
      socialHandle || '',
      reason,
      affiliateCode
    );

    const createdAffiliate = db
      .prepare('SELECT * FROM affiliates WHERE id = ?')
      .get(id);

    res.status(201).json({
      message: `Successfully verified! Now you are eligible for our affiliate program here is your 6 digit affiliate code: ${affiliateCode}`,
      affiliateCode,
      affiliate: createdAffiliate,
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not process affiliate application', error: err.message });
  }
};

// PATCH /api/affiliate/:id/status — admin manages affiliate status
exports.updateAffiliateStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!AFFILIATE_STATUSES.includes(status)) {
    return res
      .status(400)
      .json({ message: `Status must be one of: ${AFFILIATE_STATUSES.join(', ')}` });
  }

  const existing = db.prepare('SELECT * FROM affiliates WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ message: 'Affiliate application not found' });
  }

  try {
    db.prepare('UPDATE affiliates SET status = ? WHERE id = ?').run(status, id);

    const updatedAffiliate = db.prepare('SELECT * FROM affiliates WHERE id = ?').get(id);
    res.status(200).json(updatedAffiliate);
  } catch (err) {
    res.status(500).json({ message: 'Could not update affiliate status', error: err.message });
  }
};

exports.AFFILIATE_STATUSES = AFFILIATE_STATUSES;