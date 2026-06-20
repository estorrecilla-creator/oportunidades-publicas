const express = require('express');
const cors = require('cors');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Mock database for now (will connect to Supabase later)
const users = new Map();
const solicitations = new Map();
const payments = new Map();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'oportunidades-publicas-secret-key-change-in-production';

// ============================================
// UTILITIES
// ============================================

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function generateToken(userId) {
  return jwt.sign({ userId, timestamp: Date.now() }, JWT_SECRET, { expiresIn: '24h' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }
  
  const verified = verifyToken(token);
  if (!verified) {
    return res.status(403).json({ error: 'Invalid token' });
  }
  
  req.userId = verified.userId;
  next();
}

// ============================================
// STATIC FILES & HOME PAGE
// ============================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'API Oportunidades Públicas Online',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      auth: ['/api/auth/register', '/api/auth/login'],
      users: ['/api/users/profile'],
      solicitations: ['/api/solicitations', '/api/solicitations/:id'],
      documents: ['/api/documents/upload'],
      payments: ['/api/payments/checkout']
    }
  });
});

// ============================================
// AUTH ENDPOINTS
// ============================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, companyName, profileType } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    if (users.has(email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    const passwordHash = await bcryptjs.hash(password, 10);
    const userId = generateId();
    
    const user = {
      id: userId,
      email,
      password_hash: passwordHash,
      first_name: firstName || '',
      last_name: lastName || '',
      company_name: companyName || '',
      profile_type: profileType || 'freelancer',
      is_premium: false,
      created_at: new Date()
    };
    
    users.set(email, user);
    
    const token = generateToken(userId);
    
    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcryptjs.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user.id);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isPremium: user.is_premium
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// USER ENDPOINTS
// ============================================

app.get('/api/users/profile', authenticateToken, (req, res) => {
  try {
    let user = null;
    for (const u of users.values()) {
      if (u.id === req.userId) {
        user = u;
        break;
      }
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      companyName: user.company_name,
      profileType: user.profile_type,
      isPremium: user.is_premium,
      premiumTier: user.premium_tier
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SOLICITATIONS ENDPOINTS
// ============================================

app.get('/api/solicitations', authenticateToken, (req, res) => {
  try {
    const userSolicitations = [];
    for (const sol of solicitations.values()) {
      if (sol.user_id === req.userId) {
        userSolicitations.push(sol);
      }
    }
    
    res.json({
      total: userSolicitations.length,
      solicitations: userSolicitations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/solicitations', authenticateToken, (req, res) => {
  try {
    const { title, description, institution, budgetMin, budgetMax, deadline, category } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title required' });
    }
    
    const id = generateId();
    const solicitation = {
      id,
      user_id: req.userId,
      title,
      description: description || '',
      institution: institution || '',
      budget_min: budgetMin || 0,
      budget_max: budgetMax || 0,
      deadline: deadline || '',
      status: 'open',
      category: category || '',
      created_at: new Date()
    };
    
    solicitations.set(id, solicitation);
    
    res.status(201).json({
      success: true,
      solicitation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/solicitations/:id', authenticateToken, (req, res) => {
  try {
    const solicitation = solicitations.get(req.params.id);
    
    if (!solicitation || solicitation.user_id !== req.userId) {
      return res.status(404).json({ error: 'Solicitation not found' });
    }
    
    res.json(solicitation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/solicitations/:id', authenticateToken, (req, res) => {
  try {
    const solicitation = solicitations.get(req.params.id);
    
    if (!solicitation || solicitation.user_id !== req.userId) {
      return res.status(404).json({ error: 'Solicitation not found' });
    }
    
    const updated = { ...solicitation, ...req.body, updated_at: new Date() };
    solicitations.set(req.params.id, updated);
    
    res.json({
      success: true,
      solicitation: updated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/solicitations/:id', authenticateToken, (req, res) => {
  try {
    const solicitation = solicitations.get(req.params.id);
    
    if (!solicitation || solicitation.user_id !== req.userId) {
      return res.status(404).json({ error: 'Solicitation not found' });
    }
    
    solicitations.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Solicitation deleted'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DOCUMENT ENDPOINTS
// ============================================

app.post('/api/documents/upload', authenticateToken, (req, res) => {
  try {
    const { fileName, fileType, solicitation_id } = req.body;
    
    if (!fileName) {
      return res.status(400).json({ error: 'File name required' });
    }
    
    const document = {
      id: generateId(),
      user_id: req.userId,
      solicitation_id: solicitation_id || null,
      file_name: fileName,
      file_type: fileType || 'pdf',
      upload_status: 'uploaded',
      created_at: new Date()
    };
    
    res.status(201).json({
      success: true,
      document
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PAYMENT ENDPOINTS
// ============================================

app.post('/api/payments/checkout', authenticateToken, (req, res) => {
  try {
    const { plan } = req.body;
    
    const validPlans = {
      'starter': { price: 9.99, features: 50 },
      'pro': { price: 29.99, features: 500 },
      'enterprise': { price: 99.99, features: 'unlimited' }
    };
    
    if (!validPlans[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    
    const paymentSession = {
      id: generateId(),
      user_id: req.userId,
      plan,
      status: 'pending',
      created_at: new Date()
    };
    
    payments.set(paymentSession.id, paymentSession);
    
    res.status(201).json({
      success: true,
      session: paymentSession,
      planDetails: validPlans[plan]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 API Health: http://localhost:${PORT}/health`);
  console.log(`🌐 Frontend: http://localhost:${PORT}/`);
});

module.exports = app;
