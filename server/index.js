const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(body-parser.json());

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
