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

(async () => {
  const hashedPassword = await bcryptjs.hash('test1234', 12);
  users.set('test@test.com', { id: 'user123', email: 'test@test.com', password_hash: hashedPassword, firstName: 'Test', isPremium: false, createdAt: new Date() });
})();

// LICITACIONES CON REQUISITOS
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
    id: 3, 
    title: 'Ampliación Centro de Salud Triana', 
    institution: 'Servicio Andaluz de Salud', 
    budget_min: 200000, 
    budget_max: 350000, 
    deadline: '2026-09-10', 
    status: 'open', 
    category: 'obras', 
    description: 'Obras de ampliación y equipamiento médico moderno',
    requirements: [
      'Inscripción en registro de empresas de construcción',
      'Acreditación técnica de equipos sanitarios',
      'Propuesta arquitectónica',
      'Certificado de asistencia técnica',
      'Plan de cumplimiento normativo sanitario',
      'Declaración de solvencia económica'
    ],
    documents: ['registro', 'propuesta', 'certificacion', 'solvencia', 'tecnico']
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

// Extender con más licitaciones sin requisitos detallados
const baseOpps = [
  { id: 4, title: 'Reforma piscina municipal Distrito Norte', institution: 'Ayuntamiento de Sevilla', budget_min: 80000, budget_max: 150000, deadline: '2026-08-01', status: 'open', category: 'obras', description: 'Reforma vasos, vestuarios y climatización' },
  { id: 5, title: 'Carril bici segregado Corredor Este', institution: 'Consejería de Movilidad', budget_min: 300000, budget_max: 500000, deadline: '2026-07-30', status: 'open', category: 'obras', description: '8km carril bici con iluminación LED' },
  { id: 6, title: 'Restauración fachada Ayuntamiento Histórico', institution: 'Ayuntamiento de Sevilla', budget_min: 120000, budget_max: 180000, deadline: '2026-08-15', status: 'open', category: 'obras', description: 'Restauración con técnicas tradicionales' },
  { id: 7, title: 'Pavimentación parque central Distrito Sur', institution: 'Ayuntamiento de Sevilla', budget_min: 60000, budget_max: 100000, deadline: '2026-07-20', status: 'closing', category: 'obras', description: 'Pavimentación con adoquines y mobiliario' },
  { id: 8, title: 'Reparación fuentes ornamentales', institution: 'Junta de Andalucía', budget_min: 40000, budget_max: 70000, deadline: '2026-06-30', status: 'closing', category: 'obras', description: 'Sistemas hidráulicos y eléctricos de 12 fuentes' },
  { id: 9, title: 'Construcción nueva biblioteca pública', institution: 'Ayuntamiento de Sevilla', budget_min: 500000, budget_max: 800000, deadline: '2026-09-20', status: 'open', category: 'obras', description: 'Construcción completa con salas modernas y zonas verdes' },
  { id: 10, title: 'Remodelación plaza central histórica', institution: 'Ayuntamiento de Sevilla', budget_min: 250000, budget_max: 400000, deadline: '2026-08-25', status: 'open', category: 'obras', description: 'Remodelación integral con preservación histórica' },
  { id: 11, title: 'Consultoría estratégica Transformación Digital', institution: 'Consejería de Economía', budget_min: 40000, budget_max: 60000, deadline: '2026-07-30', status: 'open', category: 'servicios', description: 'Asesoramiento innovación en administración pública' },
  { id: 12, title: 'Vigilancia y seguridad 24/7', institution: 'Ayuntamiento de Sevilla', budget_min: 80000, budget_max: 120000, deadline: '2026-09-15', status: 'open', category: 'servicios', description: 'Servicios seguridad instalaciones municipales' },
  { id: 13, title: 'Mantenimiento espacios públicos anual', institution: 'Ayuntamiento de Sevilla', budget_min: 20000, budget_max: 40000, deadline: '2026-07-01', status: 'closing', category: 'servicios', description: 'Limpieza parques y conservación 12 meses' },
];

const allOpportunities = [
  ...opportunities,
  ...baseOpps.map(o => ({
    ...o,
    requirements: ['Documentación general requerida', 'Propuesta técnica', 'Presupuesto desglosado', 'Referencias de trabajos anteriores', 'Declaración de responsabilidad civil'],
    documents: ['propuesta', 'presupuesto', 'referencias']
  }))
];

// Agregar más para llegar a 45
for (let i = baseOpps.length + 5; i < 45; i++) {
  allOpportunities.push({
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
app.get('/health', (req, res) => res.json({ status: 'Online', opportunities: allOpportunities.length }));

app.get('/api/opportunities', (req, res) => {
  const { category, status, budget, search } = req.query;
  let filtered = [...allOpportunities];
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
  const opp = allOpportunities.find(o => o.id === parseInt(req.params.id));
  if (!opp) return res.status(404).json({ error: 'Not found' });
  res.json(opp);
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
    const user = { id: userId, email, password_hash: await bcryptjs.hash(password, 12), firstName: firstName || '', isPremium: false, createdAt: new Date() };
    users.set(email, user);
    const token = generateToken(userId);
    res.status(201).json({ success: true, token, user: { id: user.id, email: user.email, firstName: user.firstName } });
  } catch (e) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Required' });
    const user = users.get(email);
    if (!user || !(await bcryptjs.compare(password, user.password_hash))) return res.status(401).json({ error: 'Invalid' });
    const token = generateToken(user.id);
    res.json({ success: true, token, user: { id: user.id, email: user.email, firstName: user.firstName } });
  } catch (e) { res.status(500).json({ error: 'Error' }); }
});

app.listen(PORT, () => console.log(`✅ API Online - ${allOpportunities.length} licitaciones`));

module.exports = app;
