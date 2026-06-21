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

// PLANES
const plans = {
  free: { name: 'Gratis', price: 0, documentPrice: 0, features: ['Búsqueda', 'Presentación básica'] },
  premium: { name: 'Premium', price: 9.99, documentPrice: 29.99, features: ['Todo +', 'Documentos personalizados', 'Chat con expertos', '% éxito garantizado'] }
};

const opportunities = [
  { 
    id: 1, 
    title: 'Mejora vial integral - Avenida Constitución', 
    institution: 'Ayuntamiento de Sevilla', 
    budget_min: 100000, 
    budget_max: 200000, 
    deadline: '2026-07-15', 
    status: 'open', 
    category: 'obras', 
    description: 'Repavimentación, semaforización y mejora de accesibilidad en avenida céntrica',
    requirements: [
      'Certificado de constitución de la empresa',
      'DNI/Pasaporte del representante legal',
      'Certificado de antecedentes penales',
      'Declaración de impuestos (últimos 3 años)',
      'Seguro de responsabilidad civil',
      'Propuesta técnica detallada',
      'Presupuesto desglosado',
      'Calendario de ejecución'
    ],
    documents: ['dni', 'empresa', 'propuesta', 'presupuesto', 'seguro', 'impuestos']
  },
  { 
    id: 2, 
    title: 'Rehabilitación energética edificios públicos', 
    institution: 'Instituto Andaluz Eficiencia Energética', 
    budget_min: 150000, 
    budget_max: 250000, 
    deadline: '2026-08-20', 
    status: 'open', 
    category: 'obras', 
    description: 'Aislamiento, energías renovables e instalaciones en 5 edificios municipales',
    requirements: [
      'Acreditación como especialista en eficiencia energética',
      'Certificado de experiencia previa (mínimo 5 años)',
      'Propuesta técnica con detalles de sostenibilidad',
      'Plan de ejecución',
      'Garantía técnica',
      'Documento de responsabilidad ambiental'
    ],
    documents: ['experiencia', 'certificacion', 'propuesta', 'plan', 'garantia']
  },
  { 
    id: 29, 
    title: 'Subvención pymes Digitalización', 
    institution: 'Cámara Comercio Sevilla', 
    budget_min: 300000, 
    budget_max: 500000, 
    deadline: '2026-06-30', 
    status: 'closing', 
    category: 'subvenciones', 
    description: 'Transformación digital pequeñas medianas empresas',
    requirements: [
      'Constitución legal de la empresa (máximo 5 años)',
      'Acta de empresa con menos de 250 empleados',
      'Plan de digitalización detallado',
      'Presupuesto de inversión',
      'Justificativo de gastos proyectados',
      'Memoria técnica de impacto digital'
    ],
    documents: ['constitucion', 'empleados', 'plan', 'presupuesto', 'memoria']
  },
  { 
    id: 30, 
    title: 'Subvención autónomos Fomento Empleo', 
    institution: 'Servicio Andaluz Empleo', 
    budget_min: 500000, 
    budget_max: 1000000, 
    deadline: '2026-07-20', 
    status: 'open', 
    category: 'subvenciones', 
    description: 'Ayudas inicio ampliación actividades económicas',
    requirements: [
      'DNI del solicitante',
      'Declaración de actividad',
      'Plan de negocio',
      'Presupuesto inicial',
      'Documentos bancarios',
      'Certificado de no tener deudas públicas'
    ],
    documents: ['dni', 'plan', 'presupuesto', 'bancarios', 'deudas']
  }
];

// Llenar hasta 45
for (let i = opportunities.length; i < 45; i++) {
  opportunities.push({
    id: i,
    title: `Licitación ${i}`,
    institution: 'Institución Pública',
    budget_min: Math.random() * 400000,
    budget_max: Math.random() * 600000 + 200000,
    deadline: '2026-09-30',
    status: 'open',
    category: ['obras', 'servicios', 'suministros', 'subvenciones'][Math.floor(Math.random() * 4)],
    description: `Descripción de la licitación ${i}`,
    requirements: ['Documentación requerida', 'Propuesta técnica', 'Presupuesto desglosado'],
    documents: ['propuesta', 'presupuesto']
  });
}

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

// PREMIUM SERVICES
app.post('/api/premium/service', authenticateToken, (req, res) => {
  const user = Array.from(users.values()).find(u => u.id === req.userId);
  if (!user || !user.isPremium) return res.status(403).json({ error: 'Premium only' });

  const { opportunityId, documentType } = req.body;
  const serviceId = Date.now().toString();
  const service = {
    id: serviceId,
    userId: req.userId,
    opportunityId,
    documentType,
    status: 'waiting_data',
    price: 29.99,
    data: {},
    createdAt: new Date()
  };
  premiumServices.set(serviceId, service);
  chatMessages.set(serviceId, []);
  res.json({ success: true, serviceId, service });
});

app.post('/api/premium/chat/:serviceId', authenticateToken, (req, res) => {
  const service = premiumServices.get(req.params.serviceId);
  if (!service || service.userId !== req.userId) return res.status(403).json({ error: 'Not found' });

  const { message, type } = req.body; // type: 'user' | 'assistant'
  const msg = { type, message, timestamp: new Date() };
  
  if (!chatMessages.has(req.params.serviceId)) chatMessages.set(req.params.serviceId, []);
  chatMessages.get(req.params.serviceId).push(msg);
  
  res.json({ success: true, message: msg });
});

app.get('/api/premium/chat/:serviceId', authenticateToken, (req, res) => {
  const service = premiumServices.get(req.params.serviceId);
  if (!service || service.userId !== req.userId) return res.status(403).json({ error: 'Not found' });

  const messages = chatMessages.get(req.params.serviceId) || [];
  res.json({ messages });
});

app.patch('/api/premium/service/:serviceId/data', authenticateToken, (req, res) => {
  const service = premiumServices.get(req.params.serviceId);
  if (!service || service.userId !== req.userId) return res.status(403).json({ error: 'Not found' });

  service.data = { ...service.data, ...req.body };
  service.status = 'data_collected';
  res.json({ success: true, service });
});

app.post('/api/premium/service/:serviceId/generate', authenticateToken, (req, res) => {
  const service = premiumServices.get(req.params.serviceId);
  if (!service || service.userId !== req.userId) return res.status(403).json({ error: 'Not found' });

  const opportunity = opportunities.find(o => o.id === service.opportunityId);
  const docId = Date.now().toString();
  
  // Generar documento simulado con los datos
  const documento = {
    id: docId,
    type: service.documentType,
    serviceId: req.params.serviceId,
    title: `${service.documentType} - ${opportunity.title}`,
    content: generarDocumento(service.documentType, service.data, opportunity),
    status: 'ready',
    successRate: Math.floor(75 + Math.random() * 20), // 75-95%
    createdAt: new Date()
  };

  generatedDocuments.set(docId, documento);
  service.status = 'document_generated';
  service.generatedDocumentId = docId;

  res.json({ success: true, document: documento });
});

function generarDocumento(tipo, datos, oportunidad) {
  const fecha = new Date().toLocaleDateString('es-ES');
  
  if (tipo === 'presupuesto') {
    return `PRESUPUESTO DESGLOSADO
==================================
Licitación: ${oportunidad.title}
Institución: ${oportunidad.institution}
Fecha: ${fecha}

EMPRESA: ${datos.empresa || 'Empresa del cliente'}
CONTACTO: ${datos.contacto || 'Contacto'}

DESGLOSE DE COSTOS:
${datos.items ? datos.items.map((item, i) => `${i+1}. ${item.concepto}: €${item.cantidad}`).join('\n') : '- Concepto: A determinar'}

TOTAL: €${datos.total || 'A determinar'}

OBSERVACIONES: ${datos.observaciones || 'Sin observaciones'}

---
Documento generado automáticamente por Oportunidades Públicas
`;
  }

  if (tipo === 'plan') {
    return `PLAN DE EJECUCIÓN
==================================
Licitación: ${oportunidad.title}
Institución: ${oportunidad.institution}
Fecha: ${fecha}

EMPRESA: ${datos.empresa || 'Empresa del cliente'}

FASES DE EJECUCIÓN:
${datos.fases ? datos.fases.map((fase, i) => `FASE ${i+1}: ${fase.nombre}\nDuración: ${fase.duracion}\nTareas: ${fase.tareas}`).join('\n\n') : '- Fase 1: Planificación\n- Fase 2: Ejecución\n- Fase 3: Entrega'}

CRONOGRAMA: ${datos.cronograma || 'Cronograma detallado'}

RECURSOS: ${datos.recursos || 'Recursos necesarios'}

RIESGOS Y MITIGACIÓN: ${datos.riesgos || 'Análisis de riesgos'}

---
Documento generado automáticamente por Oportunidades Públicas
`;
  }

  return `DOCUMENTO: ${tipo}\n\nDatos del cliente:\n${JSON.stringify(datos, null, 2)}\n\nRequisitos de la licitación:\n${oportunidad.requirements.join('\n')}\n\nDocumento generado: ${fecha}`;
}

app.get('/api/premium/document/:docId', authenticateToken, (req, res) => {
  const doc = generatedDocuments.get(req.params.docId);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
});

app.get('/api/premium/services', authenticateToken, (req, res) => {
  const services = Array.from(premiumServices.values()).filter(s => s.userId === req.userId);
  res.json({ services });
});

app.get('/api/plans', (req, res) => {
  res.json(plans);
});

app.post('/api/applications', authenticateToken, (req, res) => {
  const { opportunityId, organizationName, contact, email, phone, proposal } = req.body;
  const appId = Date.now().toString();
  const app = { id: appId, userId: req.userId, opportunityId, organizationName, contact, email, phone, proposal, status: 'draft', documents: [], createdAt: new Date(), submittedAt: null };
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

app.delete('/api/documents/:id', authenticateToken, (req, res) => {
  const docs = userDocuments.get(req.userId) || [];
  const idx = docs.findIndex(d => d.id === req.params.id);
  if (idx >= 0) docs.splice(idx, 1);
  res.json({ success: true });
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

app.listen(PORT, () => console.log(`✅ API Online - ${opportunities.length} licitaciones + PREMIUM`));

module.exports = app;
