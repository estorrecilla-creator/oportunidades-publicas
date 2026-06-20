const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'API Oportunidades Públicas Online',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rutas placeholder
app.post('/api/auth/register', (req, res) => {
  res.json({ success: true, message: 'Register endpoint' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ success: true, message: 'Login endpoint' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
