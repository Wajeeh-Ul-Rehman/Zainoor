const db = require('../db');

// Helper to generate a random 6-character alphanumeric string
function generateRandomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Generates a unique User ID and verifies it doesn't already exist
exports.generateUserId = () => {
    let id;
    let isUnique = false;
    while (!isUnique) {
        id = generateRandomCode();
        const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
        if (!existing) {
            isUnique = true;
        }
    }
    return id;
};

// Generates a unique Order ID and verifies it doesn't already exist
exports.generateOrderId = () => {
    let id;
    let isUnique = false;
    while (!isUnique) {
        id = generateRandomCode();
        const existing = db.prepare('SELECT id FROM orders WHERE id = ?').get(id);
        if (!existing) {
            isUnique = true;
        }
    }
    return id;
};