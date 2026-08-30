const db = require('../db');
const bcrypt = require('bcryptjs');
const { generateUserId } = require('../utils/idGenerator'); // Import generator

// REGISTER
exports.register = (req, res) => {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "Full name, email, and password are required" });
    }

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const userId = generateUserId(); // <-- Generate 6-char unique ID

        const stmt = db.prepare('INSERT INTO users (id, fullName, email, phone, password) VALUES (?, ?, ?, ?, ?)');
        stmt.run(userId, fullName, email, phone || null, hashedPassword);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: userId,
                fullName,
                email,
                phone: phone || undefined
            }
        });
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            res.status(409).json({ message: "Email already exists" });
        } else {
            res.status(500).json({ message: "Registration failed", error: err.message });
        }
    }
};

// LOGIN
exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id, // Will return the 6-character ID
                fullName: user.fullName,
                email: user.email,
                phone: user.phone || undefined
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// LOGOUT
exports.logout = (req, res) => {
    res.status(200).json({ message: "Logout successful" });
};

// 4. GET SINGLE USER WITH ORDER HISTORY
exports.getUserWithHistory = (req, res) => {
    const { userId } = req.params;

    try {
        // 1. Fetch user info (exclude password!)
        const user = db.prepare('SELECT id, fullName, email, phone FROM users WHERE id = ?').get(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Fetch all orders belonging to this user
        const orders = db.prepare(`
            SELECT id AS orderId, orderDate, orderTime, orderStatus, shippingAddress, totalAmount, items 
            FROM orders 
            WHERE userId = ?
            ORDER BY orderDate DESC, orderTime DESC
        `).all(userId);

        // 3. Format the JSON string items back to arrays
        const formattedOrders = orders.map(order => ({
            ...order,
            items: order.items ? JSON.parse(order.items) : []
        }));

        // 4. Combine and send response
        res.status(200).json({
            ...user,
            orders: formattedOrders
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


// 5. GET ALL USERS WITH ORDER HISTORIES (Great for Admin Dashboards!)
exports.getAllUsersWithHistory = (req, res) => {
    try {
        // 1. Fetch all users in one query (excluding passwords)
        const users = db.prepare('SELECT id, fullName, email, phone FROM users').all();

        // 2. Fetch all orders in one query
        const orders = db.prepare(`
            SELECT id AS orderId, userId, orderDate, orderTime, orderStatus, shippingAddress, totalAmount, items 
            FROM orders
            ORDER BY orderDate DESC, orderTime DESC
        `).all();

        // 3. Group the orders by userId in memory for maximum speed
        const usersWithHistory = users.map(user => {
            const userOrders = orders
                .filter(order => order.userId === user.id)
                .map(order => ({
                    orderId: order.orderId,
                    orderDate: order.orderDate,
                    orderTime: order.orderTime,
                    orderStatus: order.orderStatus,
                    shippingAddress: order.shippingAddress,
                    totalAmount: order.totalAmount,
                    items: order.items ? JSON.parse(order.items) : []
                }));

            return {
                ...user,
                orders: userOrders
            };
        });

        res.status(200).json(usersWithHistory);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// 6. DELETE SINGLE USER (Cascades and deletes their orders too!)
exports.deleteUser = (req, res) => {
    const { userId } = req.params;

    try {
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        const info = stmt.run(userId);

        if (info.changes === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ 
            message: `User ${userId} and their order history have been deleted successfully.` 
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


// 7. DELETE USERS IN BULK (Using a database transaction for speed & safety)
exports.deleteUsersBulk = (req, res) => {
    const { userIds } = req.body; // Expects an array of string IDs: ["ID1", "ID2"]

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "Please provide an array of userIds to delete." });
    }

    try {
        // Compile the delete statement once
        const deleteStmt = db.prepare('DELETE FROM users WHERE id = ?');

        // Define a fast SQLite Transaction
        const runBulkDelete = db.transaction((ids) => {
            let deletedCount = 0;
            for (const id of ids) {
                const info = deleteStmt.run(id);
                deletedCount += info.changes;
            }
            return deletedCount;
        });

        // Run the transaction
        const totalDeleted = runBulkDelete(userIds);

        res.status(200).json({ 
            message: "Bulk deletion completed.",
            requestedCount: userIds.length,
            actuallyDeletedCount: totalDeleted
        });
    } catch (err) {
        res.status(500).json({ message: "Bulk deletion failed", error: err.message });
    }
};

//Update Profile
exports.updateProfile = (req, res) => {
    const { userId } = req.params;
    const { fullName, email, phone } = req.body;
 
    try {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
 
        if (email && email !== user.email) {
            const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, userId);
            if (existing) return res.status(409).json({ message: "Email already in use" });
        }
 
        db.prepare('UPDATE users SET fullName = ?, email = ?, phone = ? WHERE id = ?')
          .run(fullName || user.fullName, email || user.email, phone || user.phone, userId);
 
        const updated = db.prepare('SELECT id, fullName, email, phone FROM users WHERE id = ?').get(userId);
        res.status(200).json({ message: "Profile updated", user: updated });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};