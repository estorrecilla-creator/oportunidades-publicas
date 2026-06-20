const express = require('express');
const cors = require('cors');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Mock data storage
const users = new Map();
const solicitations = new Map();
const payments = new Map();
const pageVisits = [];
const adminUsers = new Map([['admin@oportunidades.com', { id: 'admin1', password: bcryptjs.hashSync('admin123', 10), role: 'admin' }]]);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

// Utilities
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

function requireAdmin(req, res, next) {
  if (req.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

function trackVisit(page, userId = null) {
  pageVisits.push({
    page,
    userId,
    timestamp: new Date(),
    userAgent: 'Browser'
  });
}

// ============================================
// PUBLIC ROUTES
// ============================================

app.get('/', (req, res) => {
  trackVisit('home');
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'Online ✅', version: '3.0.0' });
});

// ============================================
// AUTH ROUTES
// ============================================

app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName } = req.body;
  if (users.has(email)) return res.status(409).json({ error: 'Email exists' });
  
  const userId = Math.random().toString(36).substr(2, 9);
  const user = {
    id: userId, email, password_hash: bcryptjs.hashSync(password, 10),
    first_name: firstName || '', last_name: '', company_name: '',
    is_premium: false, created_at: new Date(), isPremium: false
  };
  users.set(email, user);
  trackVisit('register', userId);
  
  const token = generateToken(userId);
  res.status(201).json({ success: true, token, user });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  if (!user || !bcryptjs.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  trackVisit('login', user.id);
  const token = generateToken(user.id);
  res.json({ success: true, token, user });
});

// ============================================
// ADMIN AUTH
// ============================================

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const admin = adminUsers.get(email);
  if (!admin || !bcryptjs.compareSync(password, admin.password)) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
  const token = generateToken(admin.id, 'admin');
  res.json({ success: true, token, admin: { email, role: 'admin' } });
});

// ============================================
// ADMIN DASHBOARD
// ============================================

app.get('/api/admin/dashboard', authenticateToken, requireAdmin, (req, res) => {
  const totalUsers = users.size;
  const totalPayments = payments.size;
  const completedPayments = Array.from(payments.values()).filter(p => p.status === 'completed');
  const totalRevenue = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalVisits = pageVisits.length;
  const newUsersToday = Array.from(users.values()).filter(u => {
    const created = new Date(u.created_at);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  }).length;

  res.json({
    totalUsers,
    totalPayments,
    completedPayments: completedPayments.length,
    pendingPayments: totalPayments - completedPayments.length,
    totalRevenue: totalRevenue.toFixed(2),
    totalVisits,
    newUsersToday,
    conversionRate: ((totalPayments / totalVisits) * 100).toFixed(2) + '%'
  });
});

// ============================================
// ADMIN USERS
// ============================================

app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const usersList = Array.from(users.values()).map(u => ({
    id: u.id,
    email: u.email,
    firstName: u.first_name,
    lastName: u.last_name,
    company: u.company_name,
    isPremium: u.is_premium,
    createdAt: u.created_at
  }));
  res.json({ total: usersList.length, users: usersList });
});

app.get('/api/admin/users/:userId', authenticateToken, requireAdmin, (req, res) => {
  let user = null;
  for (const u of users.values()) {
    if (u.id === req.params.userId) {
      user = u;
      break;
    }
  }
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.put('/api/admin/users/:userId', authenticateToken, requireAdmin, (req, res) => {
  let user = null;
  for (const u of users.values()) {
    if (u.id === req.params.userId) {
      user = u;
      break;
    }
  }
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  Object.assign(user, req.body);
  res.json({ success: true, user });
});

app.delete('/api/admin/users/:userId', authenticateToken, requireAdmin, (req, res) => {
  let found = false;
  for (const [key, u] of users.entries()) {
    if (u.id === req.params.userId) {
      users.delete(key);
      found = true;
      break;
    }
  }
  if (!found) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true, message: 'User deleted' });
});

// ============================================
// ADMIN PAYMENTS
// ============================================

app.get('/api/admin/payments', authenticateToken, requireAdmin, (req, res) => {
  const paymentsList = Array.from(payments.values());
  res.json({ total: paymentsList.length, payments: paymentsList });
});

app.get('/api/admin/payments/by-status/:status', authenticateToken, requireAdmin, (req, res) => {
  const paymentsList = Array.from(payments.values()).filter(p => p.status === req.params.status);
  res.json({ total: paymentsList.length, payments: paymentsList });
});

// ============================================
// ADMIN ANALYTICS
// ============================================

app.get('/api/admin/analytics/visits', authenticateToken, requireAdmin, (req, res) => {
  const byPage = {};
  pageVisits.forEach(v => {
    byPage[v.page] = (byPage[v.page] || 0) + 1;
  });
  res.json({ totalVisits: pageVisits.length, byPage });
});

app.get('/api/admin/analytics/growth', authenticateToken, requireAdmin, (req, res) => {
  const growth = [];
  const days = {};
  Array.from(users.values()).forEach(u => {
    const date = new Date(u.created_at).toDateString();
    days[date] = (days[date] || 0) + 1;
  });
  res.json({ dailyRegistrations: days });
});

// ============================================
// ADMIN LOGS
// ============================================

app.get('/api/admin/logs', authenticateToken, requireAdmin, (req, res) => {
  res.json({ total: pageVisits.length, logs: pageVisits.slice(-100) });
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
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.get('/api/solicitations', authenticateToken, (req, res) => {
  const userSols = Array.from(solicitations.values()).filter(s => s.user_id === req.userId);
  res.json({ total: userSols.length, solicitations: userSols });
});

app.post('/api/solicitations', authenticateToken, (req, res) => {
  const id = Math.random().toString(36).substr(2, 9);
  const solicitation = { id, user_id: req.userId, ...req.body, created_at: new Date() };
  solicitations.set(id, solicitation);
  trackVisit('create_solicitation', req.userId);
  res.status(201).json({ success: true, solicitation });
});

app.post('/api/documents/upload', authenticateToken, (req, res) => {
  trackVisit('upload_document', req.userId);
  res.json({ success: true, document: { id: Math.random().toString(36).substr(2, 9), ...req.body } });
});

app.post('/api/payments/checkout', authenticateToken, (req, res) => {
  trackVisit('stripe_checkout', req.userId);
  const paymentId = Math.random().toString(36).substr(2, 9);
  payments.set(paymentId, {
    id: paymentId,
    user_id: req.userId,
    plan: req.body.plan,
    status: 'pending',
    created_at: new Date()
  });
  res.json({ success: true, sessionId: paymentId, url: 'https://checkout.stripe.com/pay' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`✅ API Server running on port ${PORT}`);
  console.log(`📊 Admin panel available at: /admin`);
});
