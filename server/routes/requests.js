const express = require('express');
const router = express.Router();
const db = require('../database.js');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Create a new request
router.post('/create', upload.single('photo'), (req, res) => {
    console.log('incoming create request body:', req.body);
    console.log('file info:', req.file);
    const { student_id, event_name, venue, event_date, category } = req.body;
    const photo_path = req.file ? req.file.filename : null;
    const sql = `INSERT INTO requests (student_id, event_name, venue, event_date, photo_path, category, status, mentor_status, hod_status) VALUES (?, ?, ?, ?, ?, ?, 'Pending', 'Pending', 'Pending')`;

    db.run(sql, [student_id, event_name, venue, event_date, photo_path, category || 'General'], function (err) {
        if (err) {
            console.error('DB error inserting request:', err.message);
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID, message: "Request created successfully" });
    });
});

// Get requests based on role
router.get('/', (req, res) => {
    const { role, user_id } = req.query; 

    if (role === 'student') {
        const sql = `SELECT * FROM requests WHERE student_id = ? ORDER BY submission_date DESC`;
        db.all(sql, [user_id], (err, rows) => {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ requests: rows });
        });
    } else if (role === 'mentor' || role === 'hod') {
        // First get the department of the mentor/hod
        db.get(`SELECT department FROM users WHERE id = ?`, [user_id], (err, userRow) => {
            if (err || !userRow) {
                return res.status(400).json({ error: "User not found or database error" });
            }
            
            const department = userRow.department;
            let sql = '';
            
            if (role === 'mentor') {
                sql = `SELECT r.*, u.name as student_name, u.department 
                       FROM requests r JOIN users u ON r.student_id = u.id 
                       WHERE LOWER(TRIM(u.department)) = LOWER(TRIM(?)) AND (r.mentor_status = 'Pending' OR r.mentor_status = 'Approved' OR r.mentor_status = 'Rejected') 
                       ORDER BY r.submission_date DESC`;
            } else if (role === 'hod') {
                sql = `SELECT r.*, u.name as student_name, u.department 
                       FROM requests r JOIN users u ON r.student_id = u.id 
                       WHERE LOWER(TRIM(u.department)) = LOWER(TRIM(?)) AND (r.mentor_status = 'Approved') 
                       ORDER BY r.submission_date DESC`;
            }

            db.all(sql, [department], (err, rows) => {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ requests: rows });
            });
        });
    } else {
        res.status(400).json({ error: "Invalid role" });
    }
});

// Update request status (Mentor/HOD Action)
router.put('/:id/status', (req, res) => {
    const { role, action, user_id, comment } = req.body; // action: 'Approve' or 'Reject', comment: optional comment
    const requestId = req.params.id;

    let sql = '';
    let params = [requestId];

    if (role === 'mentor') {
        if (action === 'Approve') {
            sql = `UPDATE requests SET mentor_status = 'Approved', status = 'Pending HOD', mentor_comment = ? WHERE id = ?`;
            params = [comment || null, requestId];
        } else {
            sql = `UPDATE requests SET mentor_status = 'Rejected', status = 'Rejected', mentor_comment = ? WHERE id = ?`;
            params = [comment || null, requestId];
        }
    } else if (role === 'hod') {
        if (action === 'Approve') {
            sql = `UPDATE requests SET hod_status = 'Approved', status = 'Approved', hod_comment = ? WHERE id = ?`;
            params = [comment || null, requestId];
        } else {
            sql = `UPDATE requests SET hod_status = 'Rejected', status = 'Rejected', hod_comment = ? WHERE id = ?`;
            params = [comment || null, requestId];
        }
    }

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: "Request status updated" });
    });
});

module.exports = router;
