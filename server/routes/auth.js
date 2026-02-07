const express = require('express');
const router = express.Router();
const db = require('../database.js');

// Register User (Generic for simplicity in this phase, role is key)
router.post('/register', (req, res) => {
    const { name, email, password, role, department, mobile } = req.body;
    const sql = `INSERT INTO users (name, email, password, role, department, mobile) VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(sql, [name, email, password, role, department, mobile], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID, message: "User registered successfully" });
    });
});

// Login User
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;

    db.get(sql, [email, password], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (row) {
            res.json({ message: "Login successful", user: row });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    });
});

module.exports = router;
