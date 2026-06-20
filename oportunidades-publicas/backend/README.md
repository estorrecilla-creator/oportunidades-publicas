# 🚀 OPORTUNIDADES PÚBLICAS - BACKEND

API completa para la plataforma de subvenciones automatizadas.

## 📋 STACK TECNOLÓGICO

```
Node.js + Express          API REST
Supabase                   Base de datos (PostgreSQL)
CREEM                      Procesamiento de pagos
Activepieces              Automatización de workflows
SendGrid                  Email marketing
BDNS API                  Integración de solicitudes
```

## ⚡ SETUP RÁPIDO (15 minutos)

### 1. CLONAR & INSTALAR
```bash
cd backend
npm install
cp .env.example .env
```

### 2. CONFIGURAR ENV
```bash
# .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
CREEM_API_KEY=your_key
STRIPE_SECRET_KEY=sk_live_...
```

### 3. SUPABASE SETUP
```bash
# Crear proyecto en https://supabase.com
# Ejecutar schema.sql en Supabase SQL editor
```

### 4. INICIAR SERVIDOR
```bash
npm run dev
# 🚀 Server running on port 3001
```

## 📚 API ENDPOINTS

### AUTH
```
POST   /api/auth/register         Register new user
POST   /api/auth/login            Login user
POST   /api/auth/logout           Logout (requires token)
```

### USERS
```
GET    /api/users/me              Get current user profile
PUT    /api/users/me              Update profile
```

### SUBSCRIPTIONS
```
GET    /api/subscriptions         Get user subscription
POST   /api/subscriptions         Create subscription
POST   /api/subscriptions/cancel  Cancel subscription
```

### SOLICITUDES
```
GET    /api/solicitudes           Get all user solicitudes
POST   /api/solicitudes           Create solicitud
PUT    /api/solicitudes/:id       Update solicitud
```

### SEARCH
```
GET    /api/search?query=...      Search solicitudes
```

## 🔑 AUTHENTICATION

All endpoints (except /auth) require Bearer token:

```bash
Authorization: Bearer <your_token>
```

## ⚙️ WORKFLOWS (Activepieces)

4 workflows automáticos pre-configurados:

1. **Daily Alert Workflow**
   - Sends daily email at 08:00
   - Matches user preferences
   - Updates: Every day

2. **Subscription Renewal Reminder**
   - Sends 7 days before renewal
   - Includes plan details
   - Updates: Daily check

3. **Payment Failure Recovery**
   - Retries failed payments
   - Sends email notification
   - Retries: Every 3 days

4. **BDNS Sync**
   - Syncs new solicitudes
   - Updates: Every 6 hours
   - Notifies users with matches

### Deploy Workflows
```bash
node workflows/activepieces-setup.js
```

## 💳 PAYMENT INTEGRATION

Using CREEM payment gateway:

### Create Payment
```javascript
const payment = await creemPayment.createPayment({
    amount: 71.39,
    email: 'user@example.com',
    name: 'Juan Carlos',
    description: 'Subscription - Profesional',
    user_id: 'uuid',
    subscription_id: 'uuid'
});
// Returns: checkout_url to redirect user
```

### Handle Webhook
```javascript
app.post('/webhooks/creem', (req, res) => {
    const event = req.body;
    creemPayment.handleWebhook(event);
});
```

## 📊 DATABASE SCHEMA

### Main Tables
- **users** - User accounts
- **subscriptions** - Active subscriptions
- **invoices** - Payment records
- **solicitudes** - User requests
- **alerts** - Saved searches
- **notifications** - User notifications
- **bdns_cache** - Cached solicitudes from BDNS

### Security
- Row Level Security (RLS) enabled
- Users see only their own data
- All queries filtered by user_id

## 🧪 TESTING

```bash
npm test
```

Run with coverage:
```bash
npm test -- --coverage
```

## 📦 DEPLOYMENT

### Netlify (Frontend)
```bash
# .netlify/redirects configured for API routing
```

### Railway/Render (Backend)
```bash
# Environment variables configured
npm start
```

### Database
- Supabase managed database
- Automatic backups
- Point-in-time recovery

## 🔐 SECURITY

✅ JWT authentication
✅ HTTPS only
✅ CORS configured
✅ Input validation
✅ SQL injection prevention
✅ Rate limiting ready
✅ Environment secrets management

## 📧 EMAIL TEMPLATES

SendGrid templates configured:

- `daily_alert` - Daily solicitud email
- `subscription_renewing` - Renewal reminder
- `payment_failed` - Payment error notification
- `welcome` - Welcome email

## 🐛 TROUBLESHOOTING

### Supabase Connection Failed
- Check SUPABASE_URL and SUPABASE_KEY
- Verify IP in firewall rules

### CREEM Payment Error
- Check API key validity
- Verify merchant ID configuration

### Workflow Not Triggering
- Verify Activepieces API key
- Check workflow status in dashboard

## 📖 DOCUMENTATION

- API Docs: `/api/docs` (Swagger)
- Database: `database/schema.sql`
- Workflows: `workflows/activepieces-config.json`

## 🚀 NEXT STEPS

1. ✅ Deploy to production
2. ✅ Configure domain
3. ✅ Enable SSL
4. ✅ Setup CI/CD
5. ✅ Monitor performance

## 📞 SUPPORT

For issues:
1. Check logs: `tail -f logs/app.log`
2. Test endpoints: `curl http://localhost:3001/api/health`
3. Check env vars: `cat .env | grep -v PASSWORD`

---

**Version:** 1.0.0
**Last Updated:** June 2026
**License:** MIT
