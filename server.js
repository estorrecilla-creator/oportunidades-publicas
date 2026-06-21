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
  console.log('✅ Usuario test@test.com creado como PREMIUM');
})();

// DATOS DE OPORTUNIDADES
const opportunities = [
  { id: 1, title: 'Mejora vial integral - Avenida Constitución', institution: 'Ayuntamiento de Sevilla', budget_min: 100000, budget_max: 200000, deadline: '2026-07-15', deadlineDate: new Date('2026-07-15'), status: 'open', category: 'obras', description: 'Repavimentación, semaforización y mejora de accesibilidad', requirements: ['Certificado de constitución', 'DNI del representante', 'Declaración de impuestos', 'Propuesta técnica'], documents: ['dni', 'empresa', 'propuesta', 'presupuesto'] },
  { id: 2, title: 'Rehabilitación energética edificios públicos', institution: 'Instituto Andaluz Eficiencia Energética', budget_min: 150000, budget_max: 250000, deadline: '2026-08-20', deadlineDate: new Date('2026-08-20'), status: 'open', category: 'obras', description: 'Aislamiento e instalaciones', requirements: ['Certificado especialista', 'Experiencia previa 5 años'], documents: ['certificacion', 'propuesta'] },
  { id: 29, title: 'Subvención pymes Digitalización', institution: 'Cámara Comercio Sevilla', budget_min: 300000, budget_max: 500000, deadline: '2026-06-30', deadlineDate: new Date('2026-06-30'), status: 'closing', category: 'subvenciones', description: 'Transformación digital empresas', requirements: ['Constitución legal', 'Menos 250 empleados'], documents: ['constitucion', 'plan'] },
  { id: 30, title: 'Subvención autónomos Fomento Empleo', institution: 'Servicio Andaluz Empleo', budget_min: 500000, budget_max: 1000000, deadline: '2026-07-20', deadlineDate: new Date('2026-07-20'), status: 'open', category: 'subvenciones', description: 'Ayudas inicio ampliación actividades', requirements: ['DNI solicitante', 'Plan negocio'], documents: ['dni', 'plan'] }
];

// Generar más oportunidades
for (let i = opportunities.length; i < 45; i++) {
  const days = Math.floor(Math.random() * 90) + 10;
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + days);
  opportunities.push({
    id: i, title: `Oportunidad ${i}`, institution: 'Institución Pública', budget_min: 50000, budget_max: 300000,
    deadline: deadline.toISOString().split('T')[0], deadlineDate: deadline, status: days < 30 ? 'closing' : 'open',
    category: ['obras', 'servicios', 'suministros', 'subvenciones'][Math.floor(Math.random() * 4)],
    description: `Descripción oportunidad ${i}`, requirements: ['Req1', 'Req2'], documents: ['propuesta', 'presupuesto']
  });
}

opportunities.sort((a, b) => a.deadlineDate - b.deadlineDate);

const JWT_SECRET = 'oportunidades-secret-2026';

function generateToken(userId) {
  return jwt.sign({ userId, timestamp: Date.now() }, JWT_SECRET, { expiresIn: '24h' });
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token válido:', decoded.userId);
    return decoded;
  } catch (e) {
    console.error('❌ Token inválido:', e.message);
    return null;
  }
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log('🔍 Auth header:', authHeader ? 'Present' : 'Missing');
  
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.error('❌ No hay token');
    return res.status(401).json({ error: 'Token required' });
  }
  
  const verified = verifyToken(token);
  if (!verified) {
    console.error('❌ Token inválido');
    return res.status(403).json({ error: 'Invalid token' });
  }
  
  req.userId = verified.userId;
  console.log('✅ Usuario autenticado:', req.userId);
  next();
}

// ROUTES
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/health', (req, res) => {
  console.log('🏥 Health check');
  res.json({ status: 'Online ✅', opportunities: opportunities.length, users: users.size });
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
    if (!email || !password) return res.status(400).json({ error: 'Email y password requeridos' });
    if (users.has(email)) return res.status(409).json({ error: 'Usuario ya registrado' });
    
    const userId = Math.random().toString(36).substr(2, 9);
    const user = { 
      id: userId, 
      email, 
      password_hash: await bcryptjs.hash(password, 12), 
      firstName: firstName || '', 
      isPremium: false, 
      plan: 'free', 
      createdAt: new Date() 
    };
    users.set(email, user);
    const token = generateToken(userId);
    console.log('✅ Usuario registrado:', email);
    res.status(201).json({ success: true, token, user: { id: user.id, email: user.email, firstName: user.firstName, isPremium: user.isPremium } });
  } catch (e) {
    console.error('❌ Error registro:', e.message);
    res.status(500).json({ error: 'Error al registrar' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y password requeridos' });
    
    const user = users.get(email);
    if (!user || !(await bcryptjs.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }
    
    const token = generateToken(user.id);
    console.log('✅ Login exitoso:', email);
    res.json({ success: true, token, user: { id: user.id, email: user.email, firstName: user.firstName, isPremium: user.isPremium } });
  } catch (e) {
    console.error('❌ Error login:', e.message);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

app.post('/api/applications', authenticateToken, (req, res) => {
  try {
    console.log('📤 POST /api/applications - userId:', req.userId);
    
    const user = Array.from(users.values()).find(u => u.id === req.userId);
    console.log('🔍 Usuario encontrado:', user ? user.email : 'NO ENCONTRADO');
    
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (!user.isPremium) return res.status(403).json({ error: 'Necesitas PREMIUM para participar' });

    const { opportunityId, organizationName, contact, email, phone, proposal } = req.body;
    
    if (!opportunityId || !organizationName || !contact || !email || !phone || !proposal) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
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
    console.log('✅ Aplicación guardada:', appId);
    
    res.json({ success: true, applicationId: appId, application: app });
  } catch (e) {
    console.error('❌ Error al crear aplicación:', e.message);
    res.status(500).json({ error: 'Error al crear aplicación: ' + e.message });
  }
});

app.get('/api/applications', authenticateToken, (req, res) => {
  try {
    console.log('📋 GET /api/applications - userId:', req.userId);
    const userApps = Array.from(applications.values()).filter(a => a.userId === req.userId);
    console.log('✅ Encontradas aplicaciones:', userApps.length);
    res.json({ total: userApps.length, applications: userApps });
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener aplicaciones' });
  }
});

app.patch('/api/applications/:id/submit', authenticateToken, (req, res) => {
  try {
    const app = applications.get(req.params.id);
    if (!app) return res.status(404).json({ error: 'Aplicación no encontrada' });
    if (app.userId !== req.userId) return res.status(403).json({ error: 'No tienes permiso' });
    
    app.status = 'submitted';
    app.submittedAt = new Date();
    console.log('✅ Aplicación enviada:', req.params.id);
    res.json({ success: true, application: app });
  } catch (e) {
    res.status(500).json({ error: 'Error al enviar aplicación' });
  }
});

app.post('/api/documents', authenticateToken, (req, res) => {
  try {
    const { name, type, content, applicationId } = req.body;
    const docId = 'doc_' + Date.now();
    const doc = { id: docId, userId: req.userId, name, type, content, applicationId, uploadedAt: new Date() };
    
    if (!userDocuments.has(req.userId)) userDocuments.set(req.userId, []);
    userDocuments.get(req.userId).push(doc);
    
    console.log('✅ Documento guardado:', docId);
    res.json({ success: true, document: doc });
  } catch (e) {
    res.status(500).json({ error: 'Error al guardar documento' });
  }
});

app.get('/api/documents', authenticateToken, (req, res) => {
  try {
    const docs = userDocuments.get(req.userId) || [];
    console.log('✅ Documentos encontrados:', docs.length);
    res.json({ total: docs.length, documents: docs });
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
});

app.delete('/api/documents/:id', authenticateToken, (req, res) => {
  try {
    const docs = userDocuments.get(req.userId) || [];
    const index = docs.findIndex(d => d.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Documento no encontrado' });
    docs.splice(index, 1);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Error al eliminar documento' });
  }
});

app.post('/api/payment/create-checkout', authenticateToken, (req, res) => {
  const sessionId = 'cs_' + Math.random().toString(36).substr(2, 24);
  payments.set(sessionId, { userId: req.userId, status: 'pending', createdAt: new Date() });
  res.json({ success: true, sessionId, checkoutUrl: `https://checkout.stripe.com/pay/${sessionId}` });
});

app.listen(PORT, () => console.log(`\n🚀 SERVIDOR ONLINE EN PUERTO ${PORT}\n✅ Base de datos en memoria\n✅ ${opportunities.length} oportunidades cargadas\n✅ Usuario test@test.com (PREMIUM) disponible\n`));

