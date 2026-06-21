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
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '.')));

// BASE DE DATOS EN MEMORIA
let users = new Map();
let applications = new Map();
let userDocuments = new Map();
let payments = new Map();

// USUARIO TEST HARDCODEADO
(async () => {
  const hashedPassword = await bcryptjs.hash('test1234', 12);
  users.set('test@test.com', { 
    id: 'user123', 
    email: 'test@test.com', 
    password_hash: hashedPassword, 
    firstName: 'Test Usuario', 
    isPremium: true,
    plan: 'premium',
    createdAt: new Date() 
  });
})();

// TÍTULOS REALES
const TITLES = [
  'Rehabilitación de parques públicos - Fase 1',
  'Modernización de infraestructura vial municipal',
  'Renovación integral del centro cívico',
  'Ampliación de servicios de agua potable',
  'Mejora de red de alcantarillado sanitario',
  'Construcción de centro de salud rural',
  'Pavimentación de carreteras comarcales',
  'Reparación de puentes en la región',
  'Instalación de alumbrado público LED',
  'Modernización de oficinas administrativas',
  'Reforma de equipamientos escolares',
  'Mejora de transporte público municipal',
  'Instalación de paneles solares en edificios públicos',
  'Remodelación de espacios verdes urbanos',
  'Mejora de seguridad vial - señalización',
  'Construcción de ciclovías en la ciudad',
  'Renovación de sistemas de telefonía municipal',
  'Ampliación de red de gas natural',
  'Mejora de telecomunicaciones rurales',
  'Construcción de viviendas de interés social',
  'Reparación de fachadas históricas',
  'Mejora de accesibilidad en espacios públicos',
  'Instalación de sistema de drenaje pluvial',
  'Renovación de muebles en escuelas públicas',
  'Mejora de estaciones de transporte colectivo',
  'Construcción de mercados públicos modernos',
  'Reparación de monumentos históricos',
  'Mejora de servicios de emergencia - equipamiento',
  'Instalación de sistemas de vigilancia ciudadana',
  'Renovación de centros de acogida social',
  'Mejora de carreteras de acceso a la ciudad',
  'Construcción de parques temáticos públicos',
  'Reparación de acueductos municipales',
  'Mejora de eficiencia energética - alumbrado',
  'Instalación de puntos de carga para vehículos eléctricos',
  'Renovación de bibliotecas municipales',
  'Mejora de infraestructuras deportivas',
  'Construcción de viveros municipales',
  'Reparación de sistemas de riego público',
  'Mejora de tratamiento de residuos sólidos',
  'Instalación de plantas depuradoras modernas',
  'Renovación de comedores escolares',
  'Mejora de acceso a internet en zonas rurales',
  'Construcción de centros de investigación municipal',
  'Reparación de infraestructuras portuarias'
];

// OPORTUNIDADES
const opportunities = [
  { id: 1, title: 'Mejora vial integral - Avenida Constitución', institution: 'Ayuntamiento de Sevilla', budget_min: 100000, budget_max: 200000, deadline: '2026-07-15', deadlineDate: new Date('2026-07-15'), status: 'open', category: 'obras', description: 'Repavimentación, semaforización y mejora de accesibilidad', requirements: ['Certificado de constitución', 'DNI del representante', 'Declaración de impuestos', 'Propuesta técnica'], documents: ['dni', 'empresa', 'propuesta', 'presupuesto'] },
  { id: 2, title: 'Rehabilitación energética edificios públicos', institution: 'Instituto Andaluz Eficiencia Energética', budget_min: 150000, budget_max: 250000, deadline: '2026-08-20', deadlineDate: new Date('2026-08-20'), status: 'open', category: 'obras', description: 'Aislamiento e instalaciones', requirements: ['Certificado especialista', 'Experiencia previa 5 años'], documents: ['certificacion', 'propuesta'] },
  { id: 29, title: 'Subvención pymes Digitalización', institution: 'Cámara Comercio Sevilla', budget_min: 300000, budget_max: 500000, deadline: '2026-06-30', deadlineDate: new Date('2026-06-30'), status: 'closing', category: 'subvenciones', description: 'Transformación digital empresas', requirements: ['Constitución legal', 'Menos 250 empleados'], documents: ['constitucion', 'plan'] },
  { id: 30, title: 'Subvención autónomos Fomento Empleo', institution: 'Servicio Andaluz Empleo', budget_min: 500000, budget_max: 1000000, deadline: '2026-07-20', deadlineDate: new Date('2026-07-20'), status: 'open', category: 'subvenciones', description: 'Ayudas inicio ampliación actividades', requirements: ['DNI solicitante', 'Plan negocio'], documents: ['dni', 'plan'] }
];

for (let i = 4; i < 45; i++) {
  const days = Math.floor(Math.random() * 90) + 10;
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + days);
  const titleIndex = (i - 4) % TITLES.length;
  opportunities.push({
    id: i, 
    title: TITLES[titleIndex],
    institution: 'Institución Pública Regional',
    budget_min: 50000 + Math.random() * 250000,
    budget_max: 150000 + Math.random() * 850000,
    deadline: deadline.toISOString().split('T')[0], 
    deadlineDate: deadline, 
    status: days < 30 ? 'closing' : 'open',
    category: ['obras', 'servicios', 'suministros', 'subvenciones'][Math.floor(Math.random() * 4)],
    description: `${TITLES[titleIndex]} - Proyecto de mejora e innovación infraestructural`, 
    requirements: ['Certificado de constitución', 'DNI representante', 'Propuesta técnica'], 
    documents: ['propuesta', 'presupuesto']
  });
}

opportunities.sort((a, b) => a.deadlineDate - b.deadlineDate);

const JWT_SECRET = 'oportunidades-secret-2026';

function generateToken(userId, isPremium = false) {
  return jwt.sign({ userId, isPremium, timestamp: Date.now() }, JWT_SECRET, { expiresIn: '24h' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });
  
  const verified = verifyToken(token);
  if (!verified) return res.status(403).json({ error: 'Invalid token' });
  
  // EL TOKEN ES LA FUENTE DE VERDAD - No buscar en base de datos
  req.userId = verified.userId;
  req.isPremium = verified.isPremium || false;
  next();
}

// ROUTES
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/health', (req, res) => {
  res.json({ status: 'Online ✅', opportunities: opportunities.length });
});

app.get('/api/opportunities', (req, res) => {
  const { category, status, budget, search } = req.query;
  let filtered = [...opportunities];
  if (category && category !== 'all') filtered = filtered.filter(o => o.category === category);
  if (status && status !== 'all') filtered = filtered.filter(o => o.status === status);
  if (budget && budget !== 'all') filtered = filtered.filter(o => o.budget_min >= parseInt(budget));
  if (search && search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(o => o.title.toLowerCase().includes(q) || o.description.toLowerCase().includes(q));
  }
  res.json({ total: filtered.length, opportunities: filtered });
});

app.get('/api/opportunities/:id', (req, res) => {
  const opp = opportunities.find(o => o.id === parseInt(req.params.id));
  if (!opp) return res.status(404).json({ error: 'Not found' });
  res.json(opp);
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Required' });
    if (users.has(email)) return res.status(409).json({ error: 'Ya registrado' });
    
    const userId = Math.random().toString(36).substr(2, 9);
    const user = { 
      id: userId, 
      email, 
      password_hash: await bcryptjs.hash(password, 12), 
      firstName: firstName || '', 
      isPremium: false,
      createdAt: new Date() 
    };
    users.set(email, user);
    const token = generateToken(userId, false);
    res.status(201).json({ success: true, token, user: { id: user.id, email: user.email, firstName: user.firstName, isPremium: user.isPremium } });
  } catch (e) {
    res.status(500).json({ error: 'Error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Required' });
    
    const user = users.get(email);
    if (!user || !(await bcryptjs.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    const token = generateToken(user.id, user.isPremium);
    res.json({ success: true, token, user: { id: user.id, email: user.email, firstName: user.firstName, isPremium: user.isPremium } });
  } catch (e) {
    res.status(500).json({ error: 'Error' });
  }
});

app.post('/api/applications', authenticateToken, (req, res) => {
  try {
    // EL TOKEN CONTIENE isPremium - usarlo directamente
    if (!req.isPremium) {
      return res.status(403).json({ error: 'PREMIUM required' });
    }

    const { opportunityId, organizationName, contact, email, phone, proposal } = req.body;
    
    if (!opportunityId || !organizationName || !contact || !email || !phone || !proposal) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const appId = 'app_' + Date.now();
    const app = { 
      id: appId, 
      userId: req.userId,
      opportunityId, 
      organizationName, 
      contact, 
      email, 
      phone, 
      proposal, 
      status: 'draft', 
      documents: [], 
      createdAt: new Date() 
    };
    
    applications.set(appId, app);
    res.json({ success: true, applicationId: appId, application: app });
  } catch (e) {
    res.status(500).json({ error: 'Error: ' + e.message });
  }
});

app.get('/api/applications', authenticateToken, (req, res) => {
  try {
    const userApps = Array.from(applications.values()).filter(a => a.userId === req.userId);
    res.json({ total: userApps.length, applications: userApps });
  } catch (e) {
    res.status(500).json({ error: 'Error' });
  }
});

app.patch('/api/applications/:id/submit', authenticateToken, (req, res) => {
  try {
    const app = applications.get(req.params.id);
    if (!app || app.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    app.status = 'submitted';
    app.submittedAt = new Date();
    res.json({ success: true, application: app });
  } catch (e) {
    res.status(500).json({ error: 'Error' });
  }
});

app.post('/api/documents', authenticateToken, (req, res) => {
  try {
    const { name, type, content, applicationId } = req.body;
    const docId = 'doc_' + Date.now();
    const doc = { id: docId, userId: req.userId, name, type, content, applicationId, uploadedAt: new Date() };
    if (!userDocuments.has(req.userId)) userDocuments.set(req.userId, []);
    userDocuments.get(req.userId).push(doc);
    res.json({ success: true, document: doc });
  } catch (e) {
    res.status(500).json({ error: 'Error' });
  }
});

app.get('/api/documents', authenticateToken, (req, res) => {
  try {
    const docs = userDocuments.get(req.userId) || [];
    res.json({ total: docs.length, documents: docs });
  } catch (e) {
    res.status(500).json({ error: 'Error' });
  }
});

app.delete('/api/documents/:id', authenticateToken, (req, res) => {
  try {
    const docs = userDocuments.get(req.userId) || [];
    const index = docs.findIndex(d => d.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    docs.splice(index, 1);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Error' });
  }
});

app.listen(PORT, () => console.log(`\n🚀 SERVIDOR ONLINE - PORT ${PORT}\n✅ ${opportunities.length} oportunidades\n`));

