# 🚀 Oportunidades Públicas - Backend API

Backend Node.js/Express para el portal de subvenciones y licitaciones públicas.

## 📋 Stack

- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe
- **Email:** Brevo (SendinBlue)
- **Hosting:** Railway

## 🔧 Installation

```bash
npm install
```

## 🌍 Environment Variables

Copia el archivo `.env.example` a `.env` y rellena con tus credenciales:

```bash
cp .env.example .env
```

Variables necesarias:
- `SUPABASE_URL` - URL de tu proyecto Supabase
- `SUPABASE_KEY` - Service Role Key de Supabase
- `STRIPE_SECRET_KEY` - Clave secreta de Stripe
- `BREVO_API_KEY` - API Key de Brevo
- `FRONTEND_URL` - URL del frontend (para redirects)

## 🏃 Run Locally

```bash
npm run dev
```

El servidor estará en `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```
GET /health
```
Retorna: Estado de la API

### Authentication

#### Register
```
POST /api/auth/register
Body: { email, password, name, company }
```

#### Login
```
POST /api/auth/login
Body: { email, password }
```

### Solicitations

#### Get user's solicitations
```
GET /api/solicitations/:userId
```

#### Create new solicitation
```
POST /api/solicitations
Body: { user_id, title, description, amount, deadline }
```

### Payments

#### Create checkout session
```
POST /api/payments/checkout
Body: { email, plan }
Plans: basico (€19), profesional (€59), premium (€149)
```

#### Stripe Webhook
```
POST /api/webhooks/stripe
Actualiza el plan del usuario cuando paga
```

### Email

#### Send email
```
POST /api/email/send
Body: { to, subject, htmlContent }
```

## 📊 Database Schema

### Users Table
```sql
- id (UUID)
- email (VARCHAR unique)
- password (VARCHAR hashed)
- name (VARCHAR)
- company (VARCHAR)
- plan (VARCHAR: free, basico, profesional, premium)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Solicitations Table
```sql
- id (UUID)
- user_id (UUID)
- title (VARCHAR)
- description (TEXT)
- amount (DECIMAL)
- deadline (DATE)
- status (VARCHAR: draft, submitted, approved, rejected)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🚀 Deploy en Railway

1. Ve a https://railway.app
2. Conecta tu GitHub
3. Selecciona este repositorio
4. Railway auto-detecta `package.json` y `server.js`
5. Configura variables de entorno en Railway Dashboard
6. Deploy automático en cada push a `main`

La URL será algo como: `https://oportunidades-publicas-production.up.railway.app`

## 🔐 Security Notes

- Las contraseñas se deben hashear con bcryptjs en producción (actualmente son encoding base64)
- Implementar JWT para autenticación stateless
- Validar inputs en todos los endpoints
- Usar HTTPS en producción (Railway lo hace automáticamente)
- Proteger webhook endpoints

## 📝 TODO

- [ ] Hashear contraseñas con bcryptjs
- [ ] Implementar JWT authentication
- [ ] Tests unitarios
- [ ] Documentación Swagger
- [ ] Rate limiting
- [ ] Logging y monitoring
- [ ] Error handling robusto

## 📞 Support

Contacta a Salva Vázquez (estorrecilla@gmail.com)
