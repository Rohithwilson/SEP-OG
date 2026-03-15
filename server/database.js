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

            // Create Requests Table (photo_path column may be added later)
            db.run(`CREATE TABLE IF NOT EXISTS requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER,
                event_name TEXT,
                venue TEXT,
                event_date TEXT,
                photo_path TEXT,
                category TEXT DEFAULT 'General',
                submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT, -- 'Pending', 'Pending HOD', 'Approved', 'Rejected'
                mentor_status TEXT DEFAULT 'Pending',
                hod_status TEXT DEFAULT 'Pending',
                mentor_comment TEXT,
                hod_comment TEXT,
                FOREIGN KEY (student_id) REFERENCES users(id)
            )`, (err) => {
                if (err) {
                    console.log("Error creating requests table: " + err);
                }
            });
            // If the table existed before adding photo_path we need to ensure the column exists
            db.all(`PRAGMA table_info(requests)`, (err, cols) => {
                if (!err && cols) {
                    const hasPhoto = cols.some(c => c.name === 'photo_path');
                    if (!hasPhoto) {
                        db.run(`ALTER TABLE requests ADD COLUMN photo_path TEXT`, (err) => {
                            if (err) {
                                console.log('Error adding photo_path column:', err.message);
                            } else {
                                console.log('Added photo_path column to requests table');
                            }
                        });
                    }
                    const hasCategory = cols.some(c => c.name === 'category');
                    if (!hasCategory) {
                        db.run(`ALTER TABLE requests ADD COLUMN category TEXT DEFAULT 'General'`, (err) => {
                            if (err) {
                                console.log('Error adding category column:', err.message);
                            } else {
                                console.log('Added category column to requests table');
                            }
                        });
                    }
                    const hasMentorComment = cols.some(c => c.name === 'mentor_comment');
                    if (!hasMentorComment) {
                        db.run(`ALTER TABLE requests ADD COLUMN mentor_comment TEXT`, (err) => {
                            if (err) {
                                console.log('Error adding mentor_comment column:', err.message);
                            } else {
                                console.log('Added mentor_comment column to requests table');
                            }
                        });
                    }
                    const hasHodComment = cols.some(c => c.name === 'hod_comment');
                    if (!hasHodComment) {
                        db.run(`ALTER TABLE requests ADD COLUMN hod_comment TEXT`, (err) => {
                            if (err) {
                                console.log('Error adding hod_comment column:', err.message);
                            } else {
                                console.log('Added hod_comment column to requests table');
                            }
                        });
                    }
                }
            });
        });
    }
});

module.exports = db;
