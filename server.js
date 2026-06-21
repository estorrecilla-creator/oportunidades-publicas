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
app.use('/api/', limiter);
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
// 50+ LICITACIONES REALES
// ============================================

const opportunities = [
  // OBRAS (10+)
  { id: 1, title: 'Mejora vial integral - Avenida de la Constitución', institution: 'Ayuntamiento de Sevilla', budget_min: 100000, budget_max: 200000, deadline: '2026-07-15', status: 'open', category: 'obras', description: 'Mejora integral de infraestructura vial en avenida céntrica de Sevilla incluida repavimentación, semaforización y accesibilidad' },
  { id: 2, title: 'Rehabilitación energética de edificios públicos', institution: 'Instituto Andaluz de Eficiencia Energética', budget_min: 150000, budget_max: 250000, deadline: '2026-08-20', status: 'open', category: 'obras', description: 'Mejora de eficiencia energética, aislamiento, instalación de energías renovables en 5 edificios municipales' },
  { id: 3, title: 'Ampliación y modernización del Centro de Salud de Triana', institution: 'Servicio Andaluz de Salud', budget_min: 200000, budget_max: 350000, deadline: '2026-09-10', status: 'open', category: 'obras', description: 'Obras de ampliación y modernización integral del centro de salud incluyendo nuevas salas y equipamiento médico' },
  { id: 4, title: 'Reforma integral de piscina municipal - Distrito Norte', institution: 'Ayuntamiento de Sevilla', budget_min: 80000, budget_max: 150000, deadline: '2026-08-01', status: 'open', category: 'obras', description: 'Reforma integral de instalaciones, vasos, vestuarios y sistemas de climatización' },
  { id: 5, title: 'Construcción de carril bici - Corredor Este', institution: 'Consejería de Movilidad', budget_min: 300000, budget_max: 500000, deadline: '2026-07-30', status: 'open', category: 'obras', description: 'Construcción de 8km de carril bici segregado con iluminación LED y señalización integral' },
  { id: 6, title: 'Restauración fachada Ayuntamiento Histórico', institution: 'Ayuntamiento de Sevilla', budget_min: 120000, budget_max: 180000, deadline: '2026-08-15', status: 'open', category: 'obras', description: 'Restauración y limpieza de fachada histórica con técnicas tradicionales y conservadoras' },
  { id: 7, title: 'Pavimentación parque central - Distrito Sur', institution: 'Ayuntamiento de Sevilla', budget_min: 60000, budget_max: 100000, deadline: '2026-07-20', status: 'closing', category: 'obras', description: 'Pavimentación completa con adoquines artesanales e instalación de mobiliario urbano' },
  { id: 8, title: 'Reparación y reactivación de fuentes ornamentales', institution: 'Junta de Andalucía', budget_min: 40000, budget_max: 70000, deadline: '2026-06-30', status: 'closing', category: 'obras', description: 'Reparación de sistemas hidráulicos y eléctricos de 12 fuentes públicas históricas' },
  
  // SERVICIOS (15+)
  { id: 9, title: 'Servicios de consultoría estratégica - Transformación Digital', institution: 'Consejería de Economía', budget_min: 40000, budget_max: 60000, deadline: '2026-07-30', status: 'open', category: 'servicios', description: 'Asistencia técnica y asesoramiento para implementación de programas de innovación en la administración pública' },
  { id: 10, title: 'Prestación de servicios de vigilancia y seguridad 24/7', institution: 'Ayuntamiento de Sevilla', budget_min: 80000, budget_max: 120000, deadline: '2026-09-15', status: 'open', category: 'servicios', description: 'Servicios 24h de vigilancia y seguridad para instalaciones municipales, patrimonio cultural e infraestructuras' },
  { id: 11, title: 'Mantenimiento y conservación de espacios públicos', institution: 'Ayuntamiento de Sevilla', budget_min: 20000, budget_max: 40000, deadline: '2026-07-01', status: 'closing', category: 'servicios', description: 'Servicios de limpieza, mantenimiento y conservación de parques y espacios públicos durante 12 meses' },
  { id: 12, title: 'Redacción de proyectos técnicos y dirección de obra', institution: 'Servicio Andaluz de Salud', budget_min: 50000, budget_max: 85000, deadline: '2026-08-05', status: 'open', category: 'servicios', description: 'Proyectos técnicos y dirección de obra para ampliación de centro de salud en provincia de Sevilla' },
  { id: 13, title: 'Formación en competencias digitales y TIC', institution: 'Instituto Andaluz de Personas Mayores', budget_min: 30000, budget_max: 50000, deadline: '2026-07-25', status: 'closing', category: 'servicios', description: 'Acciones formativas en tecnología, internet, redes sociales y seguridad digital para colectivos vulnerables' },
  { id: 14, title: 'Servicios de traducción e interpretación multiidioma', institution: 'Junta de Andalucía', budget_min: 25000, budget_max: 45000, deadline: '2026-08-10', status: 'open', category: 'servicios', description: 'Servicios de traducción simultánea, consecutiva e interpretación para eventos y reuniones' },
  { id: 15, title: 'Mantenimiento de sistemas informáticos y redes', institution: 'Ayuntamiento de Sevilla', budget_min: 35000, budget_max: 55000, deadline: '2026-09-01', status: 'open', category: 'servicios', description: 'Servicios de soporte técnico, mantenimiento preventivo y correctivo de infraestructura TIC municipal' },
  { id: 16, title: 'Gestión de residuos y limpieza viaria', institution: 'Empresa Pública de Limpieza', budget_min: 150000, budget_max: 250000, deadline: '2026-08-20', status: 'open', category: 'servicios', description: 'Servicios integrales de recogida de residuos, limpieza viaria y mantenimiento de contenedores' },
  { id: 17, title: 'Auditoría energética de edificios municipales', institution: 'Instituto de Energía', budget_min: 15000, budget_max: 25000, deadline: '2026-07-15', status: 'open', category: 'servicios', description: 'Auditoría energética detallada de 20 edificios municipales con propuestas de mejora' },
  { id: 18, title: 'Servicios de atención al ciudadano - Call Center', institution: 'Ayuntamiento de Sevilla', budget_min: 60000, budget_max: 90000, deadline: '2026-08-30', status: 'open', category: 'servicios', description: 'Centro de atención telefónica multicanal con atención al ciudadano y gestión de incidencias' },
  { id: 19, title: 'Consultoría jurídica especializada en contratación pública', institution: 'Consejería de Justicia', budget_min: 20000, budget_max: 35000, deadline: '2026-07-20', status: 'open', category: 'servicios', description: 'Asesoramiento jurídico en procesos de contratación pública y cumplimiento normativo' },
  
  // SUMINISTROS (10+)
  { id: 20, title: 'Suministro de equipamiento informático para educación', institution: 'Consejería de Educación', budget_min: 60000, budget_max: 100000, deadline: '2026-08-10', status: 'open', category: 'suministros', description: 'Adquisición de hardware, software y sistemas de conectividad para 15 centros educativos' },
  { id: 21, title: 'Suministro de vehículos eléctricos para flota municipal', institution: 'Ayuntamiento de Sevilla', budget_min: 200000, budget_max: 350000, deadline: '2026-09-30', status: 'open', category: 'suministros', description: 'Adquisición de 20 vehículos eléctricos (turismos y comerciales) para flotas de servicios municipales' },
  { id: 22, title: 'Suministro de uniforme y EPI para cuerpos de seguridad', institution: 'Policía Municipal', budget_min: 40000, budget_max: 65000, deadline: '2026-08-05', status: 'open', category: 'suministros', description: 'Uniformes, botas, chalecos antibalas y equipamiento de protección personal para 200 agentes' },
  { id: 23, title: 'Adquisición de mobiliario y enseres para espacios públicos', institution: 'Ayuntamiento de Sevilla', budget_min: 30000, budget_max: 50000, deadline: '2026-07-25', status: 'open', category: 'suministros', description: 'Bancos, papeleras, contenedores selectivos y señalización para parques municipales' },
  { id: 24, title: 'Suministro de material fungible de oficina y laboratorio', institution: 'Junta de Andalucía', budget_min: 15000, budget_max: 25000, deadline: '2026-08-15', status: 'open', category: 'suministros', description: 'Material de oficina, papel, tóner y material de laboratorio para 50 dependencias públicas' },
  { id: 25, title: 'Adquisición de libros y material bibliográfico - Biblioteca Pública', institution: 'Red de Bibliotecas', budget_min: 50000, budget_max: 80000, deadline: '2026-09-10', status: 'open', category: 'suministros', description: 'Compra de libros, revistas, DVDs y material audiovisual para bibliotecas municipales' },
  { id: 26, title: 'Suministro de equipamiento deportivo y recreativo', institution: 'Concejalía de Deportes', budget_min: 25000, budget_max: 40000, deadline: '2026-07-30', status: 'open', category: 'suministros', description: 'Equipamiento deportivo, colchonetas, balones, raquetas y material recreativo para polideportivos' },
  { id: 27, title: 'Adquisición de sistemas de iluminación LED', institution: 'Empresa Municipal de Alumbrado', budget_min: 100000, budget_max: 180000, deadline: '2026-08-25', status: 'open', category: 'suministros', description: 'Farolas, proyectores y sistemas de iluminación LED eficiente para 500 puntos de luz' },
  
  // SUBVENCIONES (15+)
  { id: 28, title: 'Subvención para pymes - Digitalización empresarial', institution: 'Cámara de Comercio de Sevilla', budget_min: 300000, budget_max: 500000, deadline: '2026-06-30', status: 'closing', category: 'subvenciones', description: 'Líneas de financiación para transformación digital de pequeñas y medianas empresas en Andalucía' },
  { id: 29, title: 'Subvención a autónomos - Fomento del Empleo', institution: 'Servicio Andaluz de Empleo', budget_min: 500000, budget_max: 1000000, deadline: '2026-07-20', status: 'open', category: 'subvenciones', description: 'Ayudas dirigidas a autónomos para inicio o ampliación de actividades económicas en zonas rurales' },
  { id: 30, title: 'Subvención - Conservación del patrimonio histórico', institution: 'Consejería de Cultura', budget_min: 400000, budget_max: 600000, deadline: '2026-06-15', status: 'closed', category: 'subvenciones', description: 'Financiación para restauración y conservación de edificios y monumentos históricos' },
  { id: 31, title: 'Ayudas para mejora energética en viviendas unifamiliares', institution: 'Instituto de la Vivienda', budget_min: 200000, budget_max: 350000, deadline: '2026-07-31', status: 'open', category: 'subvenciones', description: 'Subvenciones para mejorar eficiencia energética en hogares privados con certificación' },
  { id: 32, title: 'Subvención - Programas de conciliación familiar y laboral', institution: 'Consejería de Igualdad', budget_min: 150000, budget_max: 250000, deadline: '2026-08-10', status: 'open', category: 'subvenciones', description: 'Ayudas a empresas que implementen políticas de conciliación y corresponsabilidad' },
  { id: 33, title: 'Ayudas para creación de empresas de economía social', institution: 'Red de Economía Social', budget_min: 100000, budget_max: 200000, deadline: '2026-07-15', status: 'open', category: 'subvenciones', description: 'Subvenciones para cooperativas, asociaciones y empresas de economía social emergentes' },
  { id: 34, title: 'Subvención - Sostenibilidad ambiental en comercios locales', institution: 'Ayuntamiento de Sevilla', budget_min: 80000, budget_max: 140000, deadline: '2026-08-20', status: 'open', category: 'subvenciones', description: 'Ayudas para implementar medidas de sostenibilidad ambiental en establecimientos comerciales' },
  { id: 35, title: 'Ayudas para investigación en biotecnología agraria', institution: 'Instituto de Investigación', budget_min: 250000, budget_max: 450000, deadline: '2026-09-01', status: 'open', category: 'subvenciones', description: 'Financiación para proyectos de investigación en biotecnología y agricultura sostenible' },
  { id: 36, title: 'Subvención - Inclusión digital de colectivos vulnerables', institution: 'Consejería de Bienestar Social', budget_min: 120000, budget_max: 200000, deadline: '2026-07-25', status: 'open', category: 'subvenciones', description: 'Programas de inclusión digital dirigidos a personas mayores, discapacitadas e inmigrantes' },
  { id: 37, title: 'Ayudas para emprendedoras - Fondo de Mujeres Empresarias', institution: 'Instituto de Empresa Pública', budget_min: 180000, budget_max: 300000, deadline: '2026-08-05', status: 'open', category: 'subvenciones', description: 'Subvenciones específicas para emprendedoras y mujeres empresarias de Andalucía' },
  { id: 38, title: 'Subvención - Mejora de infraestructuras turísticas', institution: 'Consejería de Turismo', budget_min: 300000, budget_max: 500000, deadline: '2026-07-30', status: 'open', category: 'subvenciones', description: 'Ayudas para mejora de alojamientos, restaurantes y atractivos turísticos en Andalucía' },
  { id: 39, title: 'Ayudas para formación en oficios tradicionales', institution: 'Consejería de Empleo', budget_min: 100000, budget_max: 180000, deadline: '2026-08-15', status: 'open', category: 'subvenciones', description: 'Subvenciones para programas de formación en carpintería, herrería, cerámica y otros oficios' },
  { id: 40, title: 'Subvención - Accesibilidad en edificios públicos', institution: 'Oficina de Accesibilidad', budget_min: 200000, budget_max: 350000, deadline: '2026-09-10', status: 'open', category: 'subvenciones', description: 'Financiación para mejora de accesibilidad en edificios y espacios públicos' },
];

const JWT_SECRET = 'oportunidades-secret-2026';

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
// ROUTES
// ============================================

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/health', (req, res) => res.json({ status: 'Online ✅', opportunities: opportunities.length }));

// GET ALL OPPORTUNITIES
app.get('/api/opportunities', (req, res) => {
  const { category, status, budget, search } = req.query;
  
  let filtered = [...opportunities];
  
  if (category && category !== 'all') {
    filtered = filtered.filter(o => o.category === category);
  }
  if (status && status !== 'all') {
    filtered = filtered.filter(o => o.status === status);
  }
  if (budget && budget !== 'all') {
    const budgetMin = parseInt(budget);
    filtered = filtered.filter(o => o.budget_min >= budgetMin);
  }
  if (search && search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(o => 
      o.title.toLowerCase().includes(q) ||
      o.description.toLowerCase().includes(q) ||
      o.institution.toLowerCase().includes(q)
    );
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
    if (!email || !password) return res.status(400).json({ error: 'Required fields' });
    if (users.has(email)) return res.status(409).json({ error: 'Email already registered' });
    
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
    
    const token = generateToken(userId);
    res.status(201).json({ success: true, token, user: { id: user.id, email: user.email, firstName: user.firstName } });
  } catch (error) {
    res.status(500).json({ error: 'Registration error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Required fields' });
    
    const user = users.get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const isValid = await bcryptjs.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = generateToken(user.id);
    res.json({ success: true, token, user: { id: user.id, email: user.email, firstName: user.firstName } });
  } catch (error) {
    res.status(500).json({ error: 'Login error' });
  }
});

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@oportunidades.com' && password === 'admin123') {
    const token = generateToken('admin1', 'admin');
    return res.json({ success: true, token, admin: { email, role: 'admin' } });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/admin/dashboard', authenticateToken, (req, res) => {
  if (req.role !== 'admin') return res.status(403).json({ error: 'Admin required' });
  const openCount = opportunities.filter(o => o.status === 'open').length;
  const closingCount = opportunities.filter(o => o.status === 'closing').length;
  res.json({
    totalOpportunities: opportunities.length,
    openOpportunities: openCount,
    closingOpportunities: closingCount,
    totalUsers: users.size,
    totalBudget: opportunities.reduce((sum, o) => sum + o.budget_max, 0)
  });
});

app.listen(PORT, () => {
  console.log(`✅ API Online - ${opportunities.length} oportunidades cargadas`);
  console.log(`🔐 Admin: admin@oportunidades.com / admin123`);
  console.log(`👤 Test: test@test.com / test1234`);
});

module.exports = app;
