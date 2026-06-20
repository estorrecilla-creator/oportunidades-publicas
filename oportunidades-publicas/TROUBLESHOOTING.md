# 🔧 TROUBLESHOOTING - OPORTUNIDADES PÚBLICAS

Soluciones rápidas para problemas comunes.

---

## 🔴 PROBLEMAS SUPABASE

### "Connection refused"
```
❌ SUPABASE_URL o SUPABASE_KEY incorrectos
✅ Solución:
   1. Ir a Supabase Dashboard
   2. Settings → API
   3. Copiar correctamente URL y anon key
   4. Actualizar .env
   5. Reiniciar servidor
```

### "PGRST116 - No rows found"
```
❌ Tabla vacía o query retorna NULL
✅ Solución:
   1. Verificar que schema.sql fue ejecutado
   2. SELECT * FROM users; en Supabase SQL editor
   3. Si está vacío, ejecutar INSERT de prueba
```

### "Permission denied on schema"
```
❌ RLS policies no configuradas
✅ Solución:
   1. Ir a Supabase Dashboard
   2. Auth → Policies
   3. Ejecutar CREATE POLICY statements del schema.sql
   4. Verificar user está autenticado
```

### "Row Level Security violated"
```
❌ Usuario sin permisos para acceder datos
✅ Solución:
   1. Verificar req.user.id === row.user_id
   2. Comprobar JWT token es válido
   3. Revisar RLS policies en Supabase
```

---

## 🔴 PROBLEMAS AUTENTICACIÓN

### "Invalid token"
```
❌ JWT malformado o expirado
✅ Solución:
   1. Verificar Authorization header: Bearer <token>
   2. Token debe venir del login
   3. Verificar JWT_SECRET en .env
   4. Hacer login de nuevo
```

### "Email not verified"
```
❌ Usuario no confirmó email
✅ Solución:
   1. Ir a confirmacion-email.html
   2. Ingresar código de 6 dígitos
   3. Si no llegó email, check spam
   4. Hacer setup de SendGrid correctamente
```

### "User already exists"
```
❌ Email ya registrado
✅ Solución:
   1. Usar otro email
   2. O hacer login con email existente
   3. Si olvidó contraseña, usar resetear-contrasena.html
```

---

## 🔴 PROBLEMAS PAGOS (CREEM)

### "Payment failed - Invalid API key"
```
❌ CREEM_API_KEY incorrecto
✅ Solución:
   1. Ir a https://dashboard.creem.es
   2. Settings → API Keys
   3. Copiar key correctamente (sin espacios)
   4. Pegar en .env (CREEM_API_KEY=...)
   5. Reiniciar servidor
```

### "Webhook signature verification failed"
```
❌ CREEM_WEBHOOK_SECRET no coincide
✅ Solución:
   1. Ir a CREEM Dashboard
   2. Webhooks → Ver secret
   3. Copiar exactamente
   4. Actualizar .env (CREEM_WEBHOOK_SECRET=...)
   5. Retest webhook
```

### "Payment declined - card"
```
❌ Tarjeta inválida o insuficientes fondos
✅ Solución:
   1. Usar tarjeta de prueba: 4242 4242 4242 4242
   2. Cualquier fecha futura
   3. Cualquier CVC (3 dígitos)
   4. Si en producción, verificar tarjeta del usuario
```

### "Webhook not received"
```
❌ Webhook URL o eventos no configurados
✅ Solución:
   1. CREEM Dashboard → Webhooks
   2. Verificar URL: https://tu-dominio.com/webhooks/creem
   3. Verificar eventos seleccionados
   4. Hacer test payment desde dashboard
   5. Revisar logs en Railway
```

---

## 🔴 PROBLEMAS EMAIL (SENDGRID)

### "SENDGRID_API_KEY not found"
```
❌ Variable de entorno no configurada
✅ Solución:
   1. .env debe tener: SENDGRID_API_KEY=SG.xxx
   2. Ir a sendgrid.com → Settings → API Keys
   3. Copiar key completa
   4. Reiniciar servidor
```

### "Email template not found"
```
❌ Template ID incorrecto
✅ Solución:
   1. SendGrid → Dynamic Templates
   2. Copiar template ID (d-xxxxx)
   3. Actualizar config en api/mailer.js
   4. Verificar template existe
```

### "Email not delivered"
```
❌ Domain no verificado o sender inválido
✅ Solución:
   1. SendGrid → Settings → Sender Authentication
   2. Verificar dominio
   3. Registrar CNAME records en DNS
   4. Esperar verificación (24h)
   5. Verificar from_email en config
```

---

## 🔴 PROBLEMAS DEPLOY

### "Port already in use"
```
❌ Puerto 3001 ocupado
✅ Solución:
   1. Matar proceso: lsof -ti:3001 | xargs kill -9
   2. O usar puerto diferente: PORT=3002 npm run dev
```

### "Build failed on Netlify"
```
❌ Build script o dependencias
✅ Solución:
   1. Netlify → Site settings → Build
   2. Verificar build command
   3. Verificar publish directory
   4. npm install en local primero
   5. git push (trigger rebuild)
```

### "Build failed on Railway"
```
❌ Env variables no configuradas
✅ Solución:
   1. Railway → Variables
   2. Añadir todas las env vars
   3. Especialmente: SUPABASE_URL, SUPABASE_KEY
   4. Redeploy
```

### "502 Bad Gateway"
```
❌ Backend no responde
✅ Solución:
   1. Railway → Logs → Ver errores
   2. Verificar env variables
   3. Verificar Supabase conecta
   4. Verificar PORT = 3001
   5. Redeploy
```

---

## 🔴 PROBLEMAS PERFORMANCE

### "Page loads slowly"
```
❌ Assets grandes o queries ineficientes
✅ Solución:
   1. Lighthouse → Audit
   2. Comprimir imágenes
   3. Lazy load assets
   4. Caché agresivo
   5. CDN para estáticos
```

### "API timeout"
```
❌ Query lenta en Supabase
✅ Solución:
   1. Verificar índices: database/schema.sql
   2. Limitar LIMIT 100
   3. Usar índices de texto
   4. Optimizar joins
   5. Usar explain plan
```

### "Database quota exceeded"
```
❌ Supabase almacenamiento lleno
✅ Solución:
   1. Supabase → Storage
   2. Borrar archivos innecesarios
   3. Upgrade plan
   4. Implementar cleanup automático
```

---

## 🔴 PROBLEMAS SEGURIDAD

### "SQL Injection attempt"
```
✅ Supabase + parameterized queries previenen esto
✅ Pero si vemos logs sospechosos:
   1. Revisar logs en Railway
   2. Activar rate limiting
   3. Agregar Web Application Firewall (WAF)
```

### "Unauthorized access"
```
❌ Usuario accede datos de otro usuario
✅ Solución:
   1. Verificar RLS policies
   2. Supabase → Auth → Policies
   3. Cada query MUST filtrar por user_id
   4. Verificar req.user.id en API
```

### "CORS error"
```
❌ Frontend no puede acceder API
✅ Solución:
   1. backend/api/server.js línea ~10
   2. app.use(cors()); debe estar
   3. O configurar: cors({ origin: process.env.FRONTEND_URL })
   4. Verificar origin es correcto
```

---

## 🔴 PROBLEMAS WORKFLOW (ACTIVEPIECES)

### "Workflow not triggering"
```
❌ Trigger no configurado correctamente
✅ Solución:
   1. Activepieces Dashboard
   2. Ver logs del workflow
   3. Verificar trigger setup
   4. Hacer test manual
   5. Revisar cron expression si es schedule
```

### "SendGrid action failing"
```
❌ API key o template no encontrado
✅ Solución:
   1. Activepieces → Configure SendGrid
   2. Verificar API key
   3. Verificar template ID
   4. Test la acción
```

---

## 📊 DEBUG TIPS

### Ver logs local
```bash
npm run dev
# Todos los console.log aparecen
```

### Ver logs en producción
```bash
# Railway
railway logs

# Netlify
netlify logs:tail

# Supabase
Supabase Dashboard → Logs
```

### Test endpoint
```bash
curl -X GET http://localhost:3001/api/health
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Verificar env vars
```bash
cat .env | grep -v PASSWORD | head -20
# O en producción:
railway variables
```

---

## 🆘 EMERGENCY CONTACTS

```
Supabase Issues:      support@supabase.io
CREEM Errors:         soporte@creem.es
SendGrid Problems:    support@sendgrid.com
Railway Deployment:   support@railway.app
```

---

## 📋 CHECKLIST CUANDO ALGO FALLA

1. ✅ Leer el error COMPLETO
2. ✅ Buscar en este documento
3. ✅ Revisar logs (local o producción)
4. ✅ Verificar env variables
5. ✅ Probar localmente
6. ✅ Hacer git push y redeploy
7. ✅ Esperar 2-3 minutos
8. ✅ Clear browser cache
9. ✅ Incognito mode
10. ✅ Si nada funciona: contactar soporte

---

**RECUERDA:** La mayoría de problemas son configuración.
Verifica .env primero. 💯

