const db = require('../db');
const { generateUserId } = require('../utils/idGenerator');
const { notifyNewSubmission } = require('../utils/mailer');

exports.createSubmission = (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required.' });
  }

  try {
    const id = generateUserId();
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO submissions (id, name, email, subject, message, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, email, subject || 'General Inquiry', message, createdAt);

    const submission = { id, name, email, subject: subject || 'General Inquiry', message, createdAt };
    
    // Async admin notification
    notifyNewSubmission(submission);

    res.status(201).json({ success: true, message: 'Inquiry submitted successfully', submission });
  } catch (err) {
    res.status(500).json({ message: 'Could not process submission', error: err.message });
  }
};

exports.getAllSubmissions = (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM submissions ORDER BY createdAt DESC').all();
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch submissions', error: err.message });
  }
};

exports.deleteSubmission = (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM submissions WHERE id = ?').run(id);
    res.status(200).json({ success: true, message: 'Submission deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete submission', error: err.message });
  }
};