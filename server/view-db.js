const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('=== DATABASE CONTENTS ===\n');

// Get all tables
db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, tables) => {
    if (err) {
        console.error(err);
        db.close();
        return;
    }

    tables.forEach(table => {
        const tableName = table.name;
        console.log(`\n📋 TABLE: ${tableName}`);
        console.log('-'.repeat(60));

        db.all(`SELECT * FROM ${tableName};`, (err, rows) => {
            if (err) {
                console.error(`Error reading ${tableName}:`, err);
            } else {
                if (rows.length === 0) {
                    console.log('(empty)');
                } else {
                    console.table(rows);
                }
            }

            // Close DB after last table
            if (tableName === tables[tables.length - 1].name) {
                setTimeout(() => db.close(), 100);
            }
        });
    });
});
