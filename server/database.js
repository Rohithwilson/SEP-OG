const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');

        db.serialize(() => {
            // Create Users Table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT UNIQUE,
                password TEXT,
                role TEXT, -- 'student', 'mentor', 'hod'
                department TEXT,
                mobile TEXT
            )`, (err) => {
                if (err) {
                    console.log("Error creating users table: " + err);
                }
            });

            // Create Requests Table
            db.run(`CREATE TABLE IF NOT EXISTS requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER,
                event_name TEXT,
                venue TEXT,
                event_date TEXT,
                submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT, -- 'Pending', 'Pending HOD', 'Approved', 'Rejected'
                mentor_status TEXT DEFAULT 'Pending',
                hod_status TEXT DEFAULT 'Pending',
                FOREIGN KEY (student_id) REFERENCES users(id)
            )`, (err) => {
                if (err) {
                    console.log("Error creating requests table: " + err);
                }
            });
        });
    }
});

module.exports = db;
