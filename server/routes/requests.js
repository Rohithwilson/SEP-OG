const express = require('express');
const router = express.Router();
const db = require('../database.js');

// Create a new request
router.post('/create', (req, res) => {
    const { student_id, event_name, venue, event_date } = req.body;
    const sql = `INSERT INTO requests (student_id, event_name, venue, event_date, status, mentor_status, hod_status) VALUES (?, ?, ?, ?, 'Pending', 'Pending', 'Pending')`;

    db.run(sql, [student_id, event_name, venue, event_date], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID, message: "Request created successfully" });
    });
});

// Get requests based on role
router.get('/', (req, res) => {
    const { role, user_id } = req.query; // simplified role check
    let sql = '';
    let params = [];

    if (role === 'student') {
        sql = `SELECT * FROM requests WHERE student_id = ?`;
        params = [user_id];
    } else if (role === 'mentor') {
        sql = `SELECT r.*, u.name as student_name, u.department FROM requests r JOIN users u ON r.student_id = u.id WHERE r.mentor_status = 'Pending' OR r.mentor_status = 'Approved'`;
        // Logic might need adjustment based on mentor assignment
    } else if (role === 'hod') {
        sql = `SELECT r.*, u.name as student_name, u.department FROM requests r JOIN users u ON r.student_id = u.id WHERE r.mentor_status = 'Approved'`;
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ requests: rows });
    });
});

// Update request status (Mentor/HOD Action)
router.put('/:id/status', (req, res) => {
    const { role, action, user_id } = req.body; // action: 'Approve' or 'Reject'
    const requestId = req.params.id;

    let sql = '';
    let statusUpdate = '';

    if (role === 'mentor') {
        if (action === 'Approve') {
            sql = `UPDATE requests SET mentor_status = 'Approved', status = 'Pending HOD' WHERE id = ?`;
        } else {
            sql = `UPDATE requests SET mentor_status = 'Rejected', status = 'Rejected' WHERE id = ?`;
        }
    } else if (role === 'hod') {
        if (action === 'Approve') {
            sql = `UPDATE requests SET hod_status = 'Approved', status = 'Approved' WHERE id = ?`;
        } else {
            sql = `UPDATE requests SET hod_status = 'Rejected', status = 'Rejected' WHERE id = ?`;
        }
    }

    db.run(sql, [requestId], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: "Request status updated" });
    });
});

module.exports = router;
