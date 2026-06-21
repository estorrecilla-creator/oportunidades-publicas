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

let users = new Map();
let applications = new Map();
let userDocuments = new Map();
let premiumServices = new Map();
let generatedDocuments = new Map();
let chatMessages = new Map();
let payments = new Map();

(async () => {
  const hashedPassword = await bcryptjs.hash('test1234', 12);
  users.set('test@test.com', { 
    id: 'user123', 
    email: 'test@test.com', 
    password_hash: hashedPassword, 
    firstName: 'Test', 
    isPremium: true,
    plan: 'premium',
    createdAt: new Date() 
  });
})();

// OPORTUNIDADES CON ORDENAMIENTO POR DEADLINE
const opportunities = [
  { id: 1, title: 'Mejora vial integral - Avenida Constitución', institution: 'Ayuntamiento de Sevilla', budget_min: 100000, budget_max: 200000, deadline: '2026-07-15', deadlineDate: new Date('2026-07-15'), status: 'open', category: 'obras', description: 'Repavimentación, semaforización y mejora de accesibilidad en avenida céntrica', requirements: ['Certificado de constitución', 'DNI del representante', 'Declaración de impuestos', 'Propuesta técnica', 'Presupuesto desglosado', 'Calendario de ejecución', 'Seguro de responsabilidad civil', 'Antecedentes penales'], documents: ['dni', 'empresa', 'propuesta', 'presupuesto'] },
  { id: 2, title: 'Rehabilitación energética edificios públicos', institution: 'Instituto Andaluz Eficiencia Energética', budget_min: 150000, budget_max: 250000, deadline: '2026-08-20', deadlineDate: new Date('2026-08-20'), status: 'open', category: 'obras', description: 'Aislamiento, energías renovables e instalaciones en 5 edificios municipales', requirements: ['Certificado especialista', 'Experiencia previa 5 años', 'Propuesta técnica', 'Plan ejecución', 'Garantía técnica'], documents: ['experiencia', 'certificacion', 'propuesta', 'plan'] },
  { id: 29, title: 'Subvención pymes Digitalización', institution: 'Cámara Comercio Sevilla', budget_min: 300000, budget_max: 500000, deadline: '2026-06-30', deadlineDate: new Date('2026-06-30'), status: 'closing', category: 'subvenciones', description: 'Transformación digital pequeñas medianas empresas', requirements: ['Constitución legal empresa', 'Menos 250 empleados', 'Plan digitalización', 'Presupuesto inversión'], documents: ['constitucion', 'plan', 'presupuesto'] },
  { id: 30, title: 'Subvención autónomos Fomento Empleo', institution: 'Servicio Andaluz Empleo', budget_min: 500000, budget_max: 1000000, deadline: '2026-07-20', deadlineDate: new Date('2026-07-20'), status: 'open', category: 'subvenciones', description: 'Ayudas inicio ampliación actividades económicas', requirements: ['DNI solicitante', 'Declaración actividad', 'Plan negocio', 'Presupuesto inicial'], documents: ['dni', 'plan', 'presupuesto'] }
];

// Generar más oportunidades
for (let i = opportunities.length; i < 45; i++) {
  const days = Math.floor(Math.random() * 90) + 10;
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + days);
  
  opportunities.push({
    id: i,
    title: `Oportunidad ${i}`,
    institution: 'Institución Pública',
    budget_min: 50000,
    budget_max: 300000,
    deadline: deadline.toISOString().split('T')[0],
    deadlineDate: deadline,
    status: days < 30 ? 'closing' : 'open',
    category: ['obras', 'servicios', 'suministros', 'subvenciones'][Math.floor(Math.random() * 4)],
    description: `Descripción de la oportunidad ${i}`,
    requirements: ['Requisito 1', 'Requisito 2', 'Requisito 3'],
    documents: ['propuesta', 'presupuesto']
  });
}

// Ordenar por deadline (más recientes primero)
opportunities.sort((a, b) => a.deadlineDate - b.deadlineDate);

const JWT_SECRET = 'oportunidades-secret-2026';

function generateToken(userId, role = 'user') {
  return jwt.sign({ userId, role, timestamp: Date.now() }, JWT_SECRET, { expiresIn: '24h' });
}

function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch (e) { return null; }
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });
  const verified = verifyToken(token);
  if (!verified) return res.status(403).json({ error: 'Invalid token' });
  req.userId = verified.userId;
  next();
}

// ROUTES
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/health', (req, res) => res.json({ status: 'Online', opportunities: opportunities.length }));

app.get('/api/opportunities', (req, res) => {
  const { category, status, budget, search } = req.query;
  let filtered = [...opportunities];
  if (category && category !== 'all') filtered = filtered.filter(o => o.category === category);
  if (status && status !== 'all') filtered = filtered.filter(o => o.status === status);
  if (budget && budget !== 'all') filtered = filtered.filter(o => o.budget_min >= parseInt(budget));
  if (search && search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(o => o.title.toLowerCase().includes(q) || o.description.toLowerCase().includes(q) || o.institution.toLowerCase().includes(q));
  }
  res.json({ total: filtered.length, opportunities: filtered });
});

app.get('/api/opportunities/:id', (req, res) => {
  const opp = opportunities.find(o => o.id === parseInt(req.params.id));
  if (!opp) return res.status(404).json({ error: 'Not found' });
  res.json(opp);
});

// STRIPE PAYMENT
app.post('/api/payment/create-checkout', authenticateToken, (req, res) => {
  const { documentType, opportunityId } = req.body;
  const user = Array.from(users.values()).find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Simular sesión Stripe
  const sessionId = 'cs_' + Math.random().toString(36).substr(2, 24);
  const paymentRecord = {
    sessionId,
    userId: req.userId,
    documentType,
    opportunityId,
    amount: 2999, // €29.99
    status: 'pending',
    createdAt: new Date()
  };
  payments.set(sessionId, paymentRecord);

  res.json({ 
    success: true, 
    sessionId,
    checkoutUrl: `https://checkout.stripe.com/pay/${sessionId}`,
    redirectUrl: `/api/payment/success/${sessionId}`
  });
});

app.get('/api/payment/success/:sessionId', (req, res) => {
  const payment = payments.get(req.params.sessionId);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });

  const user = Array.from(users.values()).find(u => u.id === payment.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Marcar como PREMIUM después del pago
  user.isPremium = true;
  user.plan = 'premium';
  payment.status = 'completed';

  res.json({ success: true, message: 'Pago completado. Bienvenido a PREMIUM' });
});

app.post('/api/premium/service', authenticateToken, (req, res) => {
  const user = Array.from(users.values()).find(u => u.id === req.userId);
  if (!user || !user.isPremium) return res.status(403).json({ error: 'Premium only' });

  const { opportunityId, documentType } = req.body;
  const serviceId = Date.now().toString();
  const service = { id: serviceId, userId: req.userId, opportunityId, documentType, status: 'waiting_data', price: 29.99, data: {}, createdAt: new Date() };
  premiumServices.set(serviceId, service);
  chatMessages.set(serviceId, []);
  res.json({ success: true, serviceId, service });
});

app.post('/api/premium/chat/:serviceId', authenticateToken, (req, res) => {
  const service = premiumServices.get(req.params.serviceId);
  if (!service || service.userId !== req.userId) return res.status(403).json({ error: 'Not found' });

  const { message, type } = req.body;
  const msg = { type, message, timestamp: new Date() };
  
  if (!chatMessages.has(req.params.serviceId)) chatMessages.set(req.params.serviceId, []);
  chatMessages.get(req.params.serviceId).push(msg);
  
  res.json({ success: true, message: msg });
});

app.post('/api/applications', authenticateToken, (req, res) => {
  const user = Array.from(users.values()).find(u => u.id === req.userId);
  if (!user || !user.isPremium) return res.status(403).json({ error: 'PREMIUM required to participate' });

  const { opportunityId, organizationName, contact, email, phone, proposal } = req.body;
  const appId = Date.now().toString();
  const app = { id: appId, userId: req.userId, opportunityId, organizationName, contact, email, phone, proposal, status: 'draft', documents: [], createdAt: new Date() };
  applications.set(appId, app);
  res.json({ success: true, applicationId: appId, application: app });
});

app.get('/api/applications', authenticateToken, (req, res) => {
  const userApps = Array.from(applications.values()).filter(a => a.userId === req.userId);
  res.json({ total: userApps.length, applications: userApps });
});

app.patch('/api/applications/:id/submit', authenticateToken, (req, res) => {
  const app = applications.get(req.params.id);
  if (!app || app.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  app.status = 'submitted';
  app.submittedAt = new Date();
  res.json({ success: true, application: app });
});

app.post('/api/documents', authenticateToken, (req, res) => {
  const { name, type, content, applicationId } = req.body;
  const docId = Date.now().toString();
  const doc = { id: docId, userId: req.userId, name, type, content, applicationId, uploadedAt: new Date() };
  if (!userDocuments.has(req.userId)) userDocuments.set(req.userId, []);
  userDocuments.get(req.userId).push(doc);
  res.json({ success: true, document: doc });
});

app.get('/api/documents', authenticateToken, (req, res) => {
  const docs = userDocuments.get(req.userId) || [];
  res.json({ total: docs.length, documents: docs });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Required' });
    if (users.has(email)) return res.status(409).json({ error: 'Registered' });
    const userId = Math.random().toString(36).substr(2, 9);
    const user = { id: userId, email, password_hash: await bcryptjs.hash(password, 12), firstName: firstName || '', isPremium: false, plan: 'free', createdAt: new Date() };
    users.set(email, user);
    const token = generateToken(userId);
    res.status(201).json({ success: true, token, user: { id: user.id, email: user.email, firstName: user.firstName, isPremium: user.isPremium } });
  } catch (e) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Required' });
    const user = users.get(email);
    if (!user || !(await bcryptjs.compare(password, user.password_hash))) return res.status(401).json({ error: 'Invalid' });
    const token = generateToken(user.id);
    res.json({ success: true, token, user: { id: user.id, email: user.email, firstName: user.firstName, isPremium: user.isPremium } });
  } catch (e) { res.status(500).json({ error: 'Error' }); }
});

app.listen(PORT, () => console.log(`✅ API Online - ${opportunities.length} oportunidades ordenadas`));

module.exports = app;
