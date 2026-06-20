const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Helmet con CSP desactivado para scripts inline
app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(compression());
app.use(cors({ origin: '*', credentials: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '.')));

// ============================================
// USUARIOS PREDEFINIDOS
// ============================================

let users = new Map();

// Crear usuarios de prueba
(async () => {
  const hashedPassword = await bcryptjs.hash('test1234', 12);
  users.set('test@test.com', {
    id: 'user123',
    email: 'test@test.com',
    password_hash: hashedPassword,
    firstName: 'Test',
    lastName: 'User',
    isPremium: false,
    createdAt: new Date()
  });
})();

const payments = new Map();
const auditLog = [];
const JWT_SECRET = process.env.JWT_SECRET || 'oportunidades-secret-2026';

// ============================================
// UTILITIES
// ============================================

function generateToken(userId, role = 'user') {
  return jwt.sign({ userId, role, timestamp: Date.now() }, JWT_SECRET, { expiresIn: '24h' });
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
  if (!token) return res.status(401).json({ error: 'Token required' });
  const verified = verifyToken(token);
  if (!verified) return res.status(403).json({ error: 'Invalid token' });
  req.userId = verified.userId;
  req.role = verified.role;
  next();
}

// ============================================
// PUBLIC ROUTES
// ============================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'Online ✅', version: '3.0.0' });
});

// ============================================
// AUTH ROUTES
// ============================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }
    
    if (users.has(email)) {
      return res.status(409).json({ error: 'Email ya registrado' });
    }
    
    const userId = Math.random().toString(36).substr(2, 9);
    const user = {
      id: userId,
      email,
      password_hash: await bcryptjs.hash(password, 12),
      firstName: firstName || '',
      lastName: '',
      isPremium: false,
      createdAt: new Date()
    };
    users.set(email, user);
    
    const token = generateToken(userId);
    res.status(201).json({ 
      success: true, 
      token, 
      user: { id: user.id, email: user.email, firstName: user.firstName, isPremium: user.isPremium } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en registro' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }
    
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const isValid = await bcryptjs.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = generateToken(user.id);
    res.json({ 
      success: true, 
      token, 
      user: { id: user.id, email: user.email, firstName: user.firstName, isPremium: user.isPremium } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en login' });
  }
});

// ============================================
// USER ROUTES
// ============================================

app.get('/api/users/profile', authenticateToken, (req, res) => {
  let user = null;
  for (const u of users.values()) {
    if (u.id === req.userId) {
      user = u;
      break;
    }
  }
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json({ id: user.id, email: user.email, firstName: user.firstName, isPremium: user.isPremium });
});

app.post('/api/solicitations', authenticateToken, (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Título requerido' });
  res.status(201).json({ success: true });
});

app.get('/api/solicitations', authenticateToken, (req, res) => {
  res.json({ total: 0, solicitations: [] });
});

app.post('/api/documents/upload', authenticateToken, (req, res) => {
  res.json({ success: true });
});

app.post('/api/payments/checkout', authenticateToken, (req, res) => {
  res.json({ success: true, url: 'https://checkout.stripe.com/pay' });
});

app.post('/api/webhooks/stripe', (req, res) => {
  res.json({ received: true });
});

// ============================================
// ADMIN ROUTES
// ============================================

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@oportunidades.com' && password === 'admin123') {
    const token = generateToken('admin1', 'admin');
    return res.json({ success: true, token, admin: { email, role: 'admin' } });
  }
  
  res.status(401).json({ error: 'Credenciales inválidas' });
});

app.get('/api/admin/dashboard', authenticateToken, (req, res) => {
  if (req.role !== 'admin') return res.status(403).json({ error: 'Admin required' });
  res.json({
    totalUsers: users.size,
    totalPayments: 0,
    completedPayments: 0,
    pendingPayments: 0,
    totalRevenue: '0.00',
    totalVisits: 0,
    conversionRate: '0%'
  });
});

app.get('/api/admin/users', authenticateToken, (req, res) => {
  if (req.role !== 'admin') return res.status(403).json({ error: 'Admin required' });
  const usersList = Array.from(users.values()).map(u => ({
    id: u.id, email: u.email, firstName: u.firstName, isPremium: u.isPremium, createdAt: u.createdAt
  }));
  res.json({ total: usersList.length, users: usersList });
});

app.get('/api/admin/payments', authenticateToken, (req, res) => {
  if (req.role !== 'admin') return res.status(403).json({ error: 'Admin required' });
  res.json({ total: 0, payments: [] });
});

app.get('/api/admin/logs', authenticateToken, (req, res) => {
  if (req.role !== 'admin') return res.status(403).json({ error: 'Admin required' });
  res.json({ total: 0, logs: [] });
});

app.listen(PORT, () => {
  console.log(`✅ API v3.0.0 Online - CSP Fixed`);
  console.log(`🔐 Admin: admin@oportunidades.com / admin123`);
  console.log(`👤 Test: test@test.com / test1234`);
});

module.exports = app;
