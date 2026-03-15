const db = require('./database.js');

db.serialize(() => {
    // Update photo_path to remove 'uploads\' or 'uploads\\' prefix
    db.run(`UPDATE requests SET photo_path = REPLACE(photo_path, 'uploads\\', '') WHERE photo_path LIKE 'uploads\\%'`, function(err) {
        if (err) {
            console.error('Error updating photo paths:', err);
        } else {
            console.log('Updated', this.changes, 'photo paths');
        }
    });

    // Also try with double backslash
    db.run(`UPDATE requests SET photo_path = REPLACE(photo_path, 'uploads\\\\', '') WHERE photo_path LIKE 'uploads\\\\%'`, function(err) {
        if (err) {
            console.error('Error updating photo paths (double slash):', err);
        } else {
            console.log('Updated', this.changes, 'photo paths (double slash)');
        }
    });

    // Show updated requests
    db.all('SELECT id, photo_path FROM requests WHERE photo_path IS NOT NULL', (err, rows) => {
        if (err) {
            console.error('Error querying:', err);
        } else {
            console.log('Current photo paths:');
            rows.forEach(row => {
                console.log(`ID ${row.id}: ${row.photo_path}`);
            });
        }
        db.close();
    });
});