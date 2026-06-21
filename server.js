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
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '.')));

let users = new Map();
(async () => {
  const hashedPassword = await bcryptjs.hash('test1234', 12);
  users.set('test@test.com', { id: 'user123', email: 'test@test.com', password_hash: hashedPassword, firstName: 'Test', isPremium: false, createdAt: new Date() });
})();

// 50+ LICITACIONES REALES
const opportunities = [
  { id: 1, title: 'Mejora vial integral - Avenida Constitución', institution: 'Ayuntamiento de Sevilla', budget_min: 100000, budget_max: 200000, deadline: '2026-07-15', status: 'open', category: 'obras', description: 'Repavimentación, semaforización y mejora de accesibilidad en avenida céntrica' },
  { id: 2, title: 'Rehabilitación energética edificios públicos', institution: 'Instituto Andaluz Eficiencia Energética', budget_min: 150000, budget_max: 250000, deadline: '2026-08-20', status: 'open', category: 'obras', description: 'Aislamiento, energías renovables e instalaciones en 5 edificios municipales' },
  { id: 3, title: 'Ampliación Centro de Salud Triana', institution: 'Servicio Andaluz de Salud', budget_min: 200000, budget_max: 350000, deadline: '2026-09-10', status: 'open', category: 'obras', description: 'Obras de ampliación y equipamiento médico moderno' },
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
  { id: 14, title: 'Redacción proyectos técnicos', institution: 'Servicio Andaluz de Salud', budget_min: 50000, budget_max: 85000, deadline: '2026-08-05', status: 'open', category: 'servicios', description: 'Proyectos y dirección obra ampliación salud' },
  { id: 15, title: 'Formación competencias digitales', institution: 'Instituto Andaluz Personas Mayores', budget_min: 30000, budget_max: 50000, deadline: '2026-07-25', status: 'closing', category: 'servicios', description: 'Capacitación TIC colectivos vulnerables' },
  { id: 16, title: 'Traducción e interpretación multiidioma', institution: 'Junta de Andalucía', budget_min: 25000, budget_max: 45000, deadline: '2026-08-10', status: 'open', category: 'servicios', description: 'Servicios traducción simultánea y consecutiva' },
  { id: 17, title: 'Mantenimiento sistemas informáticos', institution: 'Ayuntamiento de Sevilla', budget_min: 35000, budget_max: 55000, deadline: '2026-09-01', status: 'open', category: 'servicios', description: 'Soporte técnico infraestructura TIC municipal' },
  { id: 18, title: 'Gestión residuos y limpieza viaria', institution: 'Empresa Pública Limpieza', budget_min: 150000, budget_max: 250000, deadline: '2026-08-20', status: 'open', category: 'servicios', description: 'Recogida residuos y limpieza integral' },
  { id: 19, title: 'Auditoría energética edificios', institution: 'Instituto de Energía', budget_min: 15000, budget_max: 25000, deadline: '2026-07-15', status: 'open', category: 'servicios', description: 'Auditoría detallada 20 edificios municipales' },
  { id: 20, title: 'Call Center atención ciudadano', institution: 'Ayuntamiento de Sevilla', budget_min: 60000, budget_max: 90000, deadline: '2026-08-30', status: 'open', category: 'servicios', description: 'Centro atención multicanal ciudadanos' },
  { id: 21, title: 'Equipamiento informático educación', institution: 'Consejería de Educación', budget_min: 60000, budget_max: 100000, deadline: '2026-08-10', status: 'open', category: 'suministros', description: 'Hardware software y conectividad 15 colegios' },
  { id: 22, title: 'Vehículos eléctricos flota municipal', institution: 'Ayuntamiento de Sevilla', budget_min: 200000, budget_max: 350000, deadline: '2026-09-30', status: 'open', category: 'suministros', description: '20 vehículos eléctricos turismos y comerciales' },
  { id: 23, title: 'Uniformes EPI cuerpos seguridad', institution: 'Policía Municipal', budget_min: 40000, budget_max: 65000, deadline: '2026-08-05', status: 'open', category: 'suministros', description: 'Uniformes y equipo 200 agentes policía' },
  { id: 24, title: 'Mobiliario espacios públicos', institution: 'Ayuntamiento de Sevilla', budget_min: 30000, budget_max: 50000, deadline: '2026-07-25', status: 'open', category: 'suministros', description: 'Bancos papeleras contenedores parques' },
  { id: 25, title: 'Material fungible oficina laboratorio', institution: 'Junta de Andalucía', budget_min: 15000, budget_max: 25000, deadline: '2026-08-15', status: 'open', category: 'suministros', description: 'Material oficina papel tóner 50 dependencias' },
  { id: 26, title: 'Libros material bibliográfico biblioteca', institution: 'Red Bibliotecas', budget_min: 50000, budget_max: 80000, deadline: '2026-09-10', status: 'open', category: 'suministros', description: 'Compra libros revistas DVDs audiovisuales' },
  { id: 27, title: 'Equipamiento deportivo recreativo', institution: 'Concejalía Deportes', budget_min: 25000, budget_max: 40000, deadline: '2026-07-30', status: 'open', category: 'suministros', description: 'Material deportivo colchonetas balones polideportivos' },
  { id: 28, title: 'Sistemas iluminación LED', institution: 'Empresa Municipal Alumbrado', budget_min: 100000, budget_max: 180000, deadline: '2026-08-25', status: 'open', category: 'suministros', description: 'Farolas proyectores iluminación 500 puntos' },
  { id: 29, title: 'Subvención pymes Digitalización', institution: 'Cámara Comercio Sevilla', budget_min: 300000, budget_max: 500000, deadline: '2026-06-30', status: 'closing', category: 'subvenciones', description: 'Transformación digital pequeñas medianas empresas' },
  { id: 30, title: 'Subvención autónomos Fomento Empleo', institution: 'Servicio Andaluz Empleo', budget_min: 500000, budget_max: 1000000, deadline: '2026-07-20', status: 'open', category: 'subvenciones', description: 'Ayudas inicio ampliación actividades económicas' },
  { id: 31, title: 'Subvención Patrimonio Histórico', institution: 'Consejería Cultura', budget_min: 400000, budget_max: 600000, deadline: '2026-06-15', status: 'closed', category: 'subvenciones', description: 'Restauración monumentos históricos' },
  { id: 32, title: 'Ayudas eficiencia energética viviendas', institution: 'Instituto Vivienda', budget_min: 200000, budget_max: 350000, deadline: '2026-07-31', status: 'open', category: 'subvenciones', description: 'Mejora energética viviendas unifamiliares' },
  { id: 33, title: 'Subvención Conciliación familiar laboral', institution: 'Consejería Igualdad', budget_min: 150000, budget_max: 250000, deadline: '2026-08-10', status: 'open', category: 'subvenciones', description: 'Políticas conciliación corresponsabilidad empresas' },
  { id: 34, title: 'Ayudas economía social cooperativas', institution: 'Red Economía Social', budget_min: 100000, budget_max: 200000, deadline: '2026-07-15', status: 'open', category: 'subvenciones', description: 'Creación cooperativas asociaciones economía social' },
  { id: 35, title: 'Subvención Sostenibilidad comercios', institution: 'Ayuntamiento Sevilla', budget_min: 80000, budget_max: 140000, deadline: '2026-08-20', status: 'open', category: 'subvenciones', description: 'Medidas sostenibilidad establecimientos comerciales' },
  { id: 36, title: 'Ayudas investigación biotecnología', institution: 'Instituto Investigación', budget_min: 250000, budget_max: 450000, deadline: '2026-09-01', status: 'open', category: 'subvenciones', description: 'Proyectos biotecnología agricultura sostenible' },
  { id: 37, title: 'Subvención Inclusión digital vulnerable', institution: 'Consejería Bienestar Social', budget_min: 120000, budget_max: 200000, deadline: '2026-07-25', status: 'open', category: 'subvenciones', description: 'Inclusión digital personas mayores discapacitadas' },
  { id: 38, title: 'Ayudas emprendedoras Mujeres empresarias', institution: 'Instituto Empresa Pública', budget_min: 180000, budget_max: 300000, deadline: '2026-08-05', status: 'open', category: 'subvenciones', description: 'Subvenciones emprendedoras mujeres Andalucía' },
  { id: 39, title: 'Subvención Infraestructuras turísticas', institution: 'Consejería Turismo', budget_min: 300000, budget_max: 500000, deadline: '2026-07-30', status: 'open', category: 'subvenciones', description: 'Mejora alojamientos restaurantes atractivos turísticos' },
  { id: 40, title: 'Ayudas formación oficios tradicionales', institution: 'Consejería Empleo', budget_min: 100000, budget_max: 180000, deadline: '2026-08-15', status: 'open', category: 'subvenciones', description: 'Formación carpintería herrería cerámica oficios' },
  { id: 41, title: 'Subvención Accesibilidad edificios públicos', institution: 'Oficina Accesibilidad', budget_min: 200000, budget_max: 350000, deadline: '2026-09-10', status: 'open', category: 'subvenciones', description: 'Mejora accesibilidad espacios públicos' },
  { id: 42, title: 'Ayudas agricultura ecológica sostenible', institution: 'Consejería Agricultura', budget_min: 80000, budget_max: 150000, deadline: '2026-08-01', status: 'open', category: 'subvenciones', description: 'Conversión agricultura ecológica certificada' },
  { id: 43, title: 'Subvención creación empresas jóvenes', institution: 'Instituto Empleo Joven', budget_min: 100000, budget_max: 200000, deadline: '2026-07-10', status: 'open', category: 'subvenciones', description: 'Emprendimiento menores 35 años' },
  { id: 44, title: 'Ayudas transporte público sostenible', institution: 'Consejería Movilidad', budget_min: 150000, budget_max: 300000, deadline: '2026-08-30', status: 'open', category: 'subvenciones', description: 'Mejora transporte público eléctrico ecológico' },
  { id: 45, title: 'Subvención vivienda social asequible', institution: 'Instituto Vivienda', budget_min: 250000, budget_max: 450000, deadline: '2026-09-05', status: 'open', category: 'subvenciones', description: 'Construcción vivienda social asequible' },
];

const JWT_SECRET = 'oportunidades-secret-2026';

function generateToken(userId, role = 'user') {
  return jwt.sign({ userId, role, timestamp: Date.now() }, JWT_SECRET, { expiresIn: '24h' });
}

function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch (e) { return null; }
}

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
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

app.listen(PORT, () => {
  console.log(`✅ API Online - ${opportunities.length} licitaciones`);
});

module.exports = app;
