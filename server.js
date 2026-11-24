// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// A simple test route to prove the server works securely
app.get('/api/status', (req, res) => {
    res.json({ 
        message: "Nexus Backend is running securely!", 
        timestamp: new Date().toISOString() 
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Secure Nexus Backend running on http://localhost:${PORT}`);
    console.log(`👉 Test the server by visiting http://localhost:${PORT}/api/status in your browser`);
});
