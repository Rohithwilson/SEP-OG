const express = require('express');
const router = express.Router();
const db = require('../database.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Register User (Generic for simplicity in this phase, role is key)
router.post('/register', async (req, res) => {
    const { name, email, password, role, department, mobile } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sql = `INSERT INTO users (name, email, password, role, department, mobile) VALUES (?, ?, ?, ?, ?, ?)`;

        db.run(sql, [name, email, hashedPassword, role, department, mobile], function (err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ id: this.lastID, message: "User registered successfully" });
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to hash password" });
    }
});

// Login User
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT * FROM users WHERE email = ?`;

    db.get(sql, [email], async (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (row) {
            // Check if the stored password looks like a bcrypt hash (starts with $2b$, $2a$, etc.)
            let isMatch = false;
            if (row.password && row.password.startsWith('$2')) {
                isMatch = await bcrypt.compare(password, row.password);
            } else {
                // Fallback for plain-text passwords created before hashing was implemented
                isMatch = (password === row.password);
            }

            if (isMatch) {
                // Don't send the password back to the client
                const { password: _, ...userWithoutPassword } = row;
                res.json({ message: "Login successful", user: userWithoutPassword });
            } else {
                res.status(401).json({ message: "Invalid credentials" });
            }
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    });
});

module.exports = router;
