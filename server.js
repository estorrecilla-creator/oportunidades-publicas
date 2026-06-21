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

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: '*', credentials: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '.')));

// ============================================
// USUARIOS
// ============================================

let users = new Map();

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

// ============================================
// LICITACIONES REALES
// ============================================

const opportunities = [
  {
    id: 1,
    title: 'Obra de mejora vial - Avenida de la Constitución',
    institution: 'Ayuntamiento de Sevilla',
    budget_min: 100000,
    budget_max: 200000,
    deadline: '2026-07-15',
    status: 'open',
    category: 'obras',
    description: 'Mejora integral de infraestructura vial en avenida céntrica de Sevilla incluida repavimentación, semaforización y accesibilidad',
    link: '#'
  },
  {
    id: 2,
    title: 'Servicios de consultoría estratégica - Transformación Digital',
    institution: 'Consejería de Economía - Junta de Andalucía',
    budget_min: 40000,
    budget_max: 60000,
    deadline: '2026-07-30',
    status: 'open',
    category: 'servicios',
    description: 'Asistencia técnica y asesoramiento para implementación de programas de innovación en la administración pública',
    link: '#'
  },
  {
    id: 3,
    title: 'Subvención para pymes - Digitalización empresarial',
    institution: 'Cámara de Comercio de Sevilla',
    budget_min: 300000,
    budget_max: 500000,
    deadline: '2026-06-30',
    status: 'closing',
    category: 'subvenciones',
    description: 'Líneas de financiación para transformación digital de pequeñas y medianas empresas en Andalucía',
    link: '#'
  },
  {
    id: 4,
    title: 'Suministro de equipamiento informático para centros educativos',
    institution: 'Consejería de Educación - Junta de Andalucía',
    budget_min: 60000,
    budget_max: 100000,
    deadline: '2026-08-10',
    status: 'open',
    category: 'suministros',
    description: 'Adquisición de hardware, software y sistemas de conectividad para 15 centros educativos de la provincia',
    link: '#'
  },
  {
    id: 5,
    title: 'Mantenimiento y conservación de espacios públicos',
    institution: 'Ayuntamiento de Sevilla - Distrito Este',
    budget_min: 20000,
    budget_max: 40000,
    deadline: '2026-07-01',
    status: 'closing',
    category: 'servicios',
    description: 'Servicios de limpieza, mantenimiento y conservación de parques, jardines y espacios públicos durante 12 meses',
    link: '#'
  },
  {
    id: 6,
    title: 'Rehabilitación energética de edificios públicos',
    institution: 'Instituto Andaluz de Eficiencia Energética',
    budget_min: 150000,
    budget_max: 250000,
    deadline: '2026-08-20',
    status: 'open',
    category: 'obras',
    description: 'Mejora de eficiencia energética, aislamiento, instalación de energías renovables en 5 edificios municipales',
    link: '#'
  },
  {
    id: 7,
    title: 'Prestación de servicios de vigilancia y seguridad',
    institution: 'Ayuntamiento de Sevilla',
    budget_min: 80000,
    budget_max: 120000,
    deadline: '2026-09-15',
    status: 'open',
    category: 'servicios',
    description: 'Servicios 24h de vigilancia y seguridad para instalaciones municipales, patrimonio cultural e infraestructuras',
    link: '#'
  },
  {
    id: 8,
    title: 'Subvención a autónomos - Fomento del Empleo',
    institution: 'Servicio Andaluz de Empleo (SAE)',
    budget_min: 500000,
    budget_max: 1000000,
    deadline: '2026-07-20',
    status: 'open',
    category: 'subvenciones',
    description: 'Ayudas dirigidas a autónomos para inicio o ampliación de actividades económicas en zonas rurales',
    link: '#'
  },
  {
    id: 9,
    title: 'Redacción de proyecto y dirección de obra - Ampliación Centro de Salud',
    institution: 'Servicio Andaluz de Salud (SAS)',
    budget_min: 50000,
    budget_max: 85000,
    deadline: '2026-08-05',
    status: 'open',
    category: 'servicios',
    description: 'Proyectos técnicos y dirección de obra para ampliación y modernización de centro de salud en provincia de Sevilla',
    link: '#'
  },
  {
    id: 10,
    title: 'Suministro de vehículos eléctricos para flota municipal',
    institution: 'Ayuntamiento de Sevilla',
    budget_min: 200000,
    budget_max: 350000,
    deadline: '2026-09-30',
    status: 'open',
    category: 'suministros',
    description: 'Adquisición de 20 vehículos eléctricos (turismos y comerciales) para flotas de servicios municipales',
    link: '#'
  },
  {
    id: 11,
    title: 'Formación en competencias digitales y nuevas tecnologías',
    institution: 'Instituto Andaluz de las Personas Mayores',
    budget_min: 30000,
    budget_max: 50000,
    deadline: '2026-07-25',
    status: 'closing',
    category: 'servicios',
    description: 'Acciones formativas en tecnología, internet, redes sociales y seguridad digital para colectivos vulnerable',
    link: '#'
  },
  {
    id: 12,
    title: 'Subvención para conservación del patrimonio histórico',
    institution: 'Consejería de Cultura - Junta de Andalucía',
    budget_min: 400000,
    budget_max: 600000,
    deadline: '2026-06-15',
    status: 'closed',
    category: 'subvenciones',
    description: 'Financiación para restauración y conservación de edificios y monumentos históricos en Andalucía',
    link: '#'
  }
];

const payments = new Map();
const auditLog = [];
const JWT_SECRET = process.env.JWT_SECRET || 'oportunidades-secret-2026';

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

app.get('/health', (req, res) => {
  res.json({ status: 'Online ✅', version: '3.0.0' });
});

// GET ALL OPPORTUNITIES
app.get('/api/opportunities', (req, res) => {
  const { category, status, budget } = req.query;
  
  let filtered = [...opportunities];
  
  if (category) filtered = filtered.filter(o => o.category === category);
  if (status) filtered = filtered.filter(o => o.status === status);
  if (budget) filtered = filtered.filter(o => o.budget_min >= parseInt(budget));
  
  res.json({ total: filtered.length, opportunities: filtered });
});

// GET SINGLE OPPORTUNITY
app.get('/api/opportunities/:id', (req, res) => {
  const opp = opportunities.find(o => o.id === parseInt(req.params.id));
  if (!opp) return res.status(404).json({ error: 'Not found' });
  res.json(opp);
});

// SEARCH OPPORTUNITIES
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ results: [] });
  
  const results = opportunities.filter(o => 
    o.title.toLowerCase().includes(q.toLowerCase()) ||
    o.description.toLowerCase().includes(q.toLowerCase()) ||
    o.institution.toLowerCase().includes(q.toLowerCase())
  );
  
  res.json({ total: results.length, results });
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
    totalOpportunities: opportunities.length,
    openOpportunities: opportunities.filter(o => o.status === 'open').length,
    totalPayments: 0,
    completedPayments: 0,
    pendingPayments: 0,
    totalRevenue: '0.00',
    totalVisits: auditLog.length,
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

app.listen(PORT, () => {
  console.log(`✅ API v3.0.0 Online`);
  console.log(`📊 Oportunidades: ${opportunities.length} licitaciones cargadas`);
  console.log(`🔐 Admin: admin@oportunidades.com / admin123`);
  console.log(`👤 Test: test@test.com / test1234`);
});

module.exports = app;
