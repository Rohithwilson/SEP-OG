const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const db = require('./database.js');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

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

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes will go here
app.get('/', (req, res) => {
    res.send('College Event Permission System API is running');
});

// Import routes
const authRoutes = require('./routes/auth.js');
const requestRoutes = require('./routes/requests.js');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);

// Export upload middleware for use in routes
module.exports = { upload };

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Make sure no other server is running or change the PORT environment variable.`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
    }
});
