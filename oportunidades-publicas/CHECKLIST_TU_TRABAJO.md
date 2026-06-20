# ✅ CHECKLIST - LO QUE TIENES QUE HACER (SALVA)

**Estimado: 8-10 horas de trabajo manual**

---

## 🎯 FASE 1: INFRAESTRUCTURA (2-3 horas)

### PASO 1: Registrar Dominio ⏱️ 15 MIN
```
Ir a: https://www.namecheap.com o https://www.godaddy.com

Opciones (en orden de preferencia):
  1. licitacionespublicas.es         (€15-20/año) ← MEJOR
  2. oportunidadespublicas.es        (€15-20/año) ← ALTERNATIVA
  3. ayudaspublicas.es               (€15-20/año) ← SI OTROS NO)
  
Proceso:
  □ Buscar dominio
  □ Agregar a carrito
  □ Checkout (paga con tarjeta)
  □ Verificar email de confirmación
  □ Guardar credenciales (usuario/contraseña)
  
Resultado esperado:
  ✅ Dominio registrado y activo
  ✅ Credenciales guardadas
```

### PASO 2: Crear Cuenta GitHub ⏱️ 10 MIN
```
Ir a: https://github.com/signup

Proceso:
  □ Email: tu email personal (ej: salva@gmail.com)
  □ Contraseña: fuerte (mínimo 16 caracteres)
  □ Username: algo profesional (ej: salva-vazquez o salvavaz)
  □ Verificar email
  
Después de crear:
  □ Ir a https://github.com/new
  □ Crear repositorio nuevo:
     • Nombre: "oportunidades-publicas"
     • Descripción: "Portal de subvenciones y licitaciones públicas"
     • Público: SÍ (necesitas que otros vean el código)
     • Initialize: NO (vamos a pushear desde local)
  
Resultado esperado:
  ✅ Repositorio vacío creado
  ✅ URL: https://github.com/[tu-usuario]/oportunidades-publicas
```

### PASO 3: Pushear Código a GitHub ⏱️ 30 MIN
```
EN TU TERMINAL/CMD:

1. Instalar Git (si no lo tienes):
   Windows: https://git-scm.com/download/win
   Mac: brew install git
   Linux: sudo apt-get install git

2. Configurar Git:
   git config --global user.name "Salva Vázquez"
   git config --global user.email "tu@email.com"

3. Ir a tu carpeta /outputs:
   cd /mnt/user-data/outputs
   (o donde tengas los archivos)

4. Inicializar repo local:
   git init
   git add .
   git commit -m "Initial commit: Oportunidades Públicas MVP"

5. Conectar a GitHub:
   git remote add origin https://github.com/[tu-usuario]/oportunidades-publicas.git
   git branch -M main
   git push -u origin main

6. LISTO. Verifica en GitHub:
   - Abre https://github.com/[tu-usuario]/oportunidades-publicas
   - Deberías ver todos tus archivos

Resultado esperado:
  ✅ Código en GitHub
  ✅ 56+ archivos visibles
  ✅ Backend carpeta visible
```

---

## 🔧 FASE 2: SERVICIOS EXTERNOS (3-4 horas)

### PASO 4: Crear Cuenta Supabase ⏱️ 20 MIN
```
Ir a: https://supabase.com/

Proceso:
  □ Click "Start your project"
  □ Signup con GitHub (más fácil):
    - Click "Continue with GitHub"
    - Autorizar Supabase
    - Verificar email
  
  □ Crear organización:
    - Nombre: "Oportunidades Públicas"
    - Plan: FREE (suficiente para MVP)
  
  □ Crear proyecto:
    - Nombre: "oportunidades-publicas-prod"
    - Región: Europe (para latency bajo)
    - Database Password: Algo fuerte (GUARDA ESTO)
    - Pricing Plan: Free
    - Click "Create new project"
    - ESPERAR 5 minutos (inicializa la BD)

Después de crear:
  □ Ir a SQL Editor (esquina izq)
  □ Click "New Query"
  □ Copiar TODO el contenido de /backend/database/schema.sql
  □ Pegar en el editor
  □ Click "Run"
  □ Esperar a que ejecute (1-2 min)
  
Verificar:
  □ Ir a "Tables" en sidebar
  □ Deberías ver 15 tablas: users, subscriptions, solicitudes, etc.

Guardar credenciales:
  □ Ir a Settings → API
  □ Copiar:
    - Project URL: https://xxxxx.supabase.co
    - Anon Public Key: eyJxxx...
    - Service Role Key: eyJxxx...
  □ Guardar en archivo seguro (necesitarás después)

Resultado esperado:
  ✅ Supabase proyecto creado
  ✅ 15 tablas en BD
  ✅ Credenciales guardadas
```

### PASO 5: Crear Cuenta CREEM (Pagos) ⏱️ 30 MIN
```
Ir a: https://dashboard.creem.es/

Proceso:
  □ Click "Registrarse"
  □ Email: tu email empresa
  □ Contraseña: fuerte
  □ Nombre empresa: "Oportunidades Públicas"
  □ NIF/CIF: Tu NIF de empresa (o DNI si autónomo)
  □ Dirección: Tu dirección
  □ Teléfono: Tu teléfono
  □ Aceptar términos
  □ Verificar email (te llegará link)

Después de verificar:
  □ Completa perfil bancario:
    - Ir a "Configuración" → "Datos Bancarios"
    - IBAN: Tu cuenta (para recibir pagos)
    - Nombre titular: Tu nombre
  
  □ Obtener credenciales API:
    - Ir a "Settings" → "API Keys"
    - Copiar:
      • API Key (público): xxxx-xxxx-xxxx
      • Webhook Secret: xxxx-xxxx-xxxx
    - Guardar en archivo seguro

  □ Configurar Webhook:
    - URL: https://tu-dominio.com/webhooks/creem
    - (Ya lo haremos cuando tengamos dominio)

Resultado esperado:
  ✅ Cuenta CREEM creada
  ✅ Datos bancarios verificados
  ✅ API Keys guardadas
```

### PASO 6: Crear Cuenta SendGrid (Email) ⏱️ 20 MIN
```
Ir a: https://sendgrid.com/

Proceso:
  □ Click "Start Free"
  □ Email: tu email
  □ Contraseña: fuerte
  □ Nombre completo: Tu nombre
  □ Nombre empresa: "Oportunidades Públicas"
  □ Plan: Free (100 emails/día, suficiente)
  □ Verificar email

Después de crear:
  □ Ir a "Settings" → "API Keys"
  □ Click "Create API Key"
  □ Name: "oportunidades-produccion"
  □ Full Access
  □ Click "Create & Copy"
  □ Guardar key en archivo seguro (API_KEY_SENDGRID)

Configurar dominio (OPCIONAL pero recomendado):
  □ Ir a "Settings" → "Sender Authentication"
  □ Click "Verify a Domain"
  □ Dominio: tu-dominio.com
  □ Copiar records CNAME que te da
  □ Ir a tu registrador de dominio (Namecheap, etc.)
  □ Agregar esos CNAME records
  □ Esperar 24h para verificación

Resultado esperado:
  ✅ Cuenta SendGrid creada
  ✅ API Key guardada
  ✅ Email verificado
```

### PASO 7: Setup Calendly (Agendador demos) ⏱️ 10 MIN
```
Ir a: https://calendly.com/

Proceso:
  □ Click "Sign up"
  □ Email: tu email
  □ Contraseña: cualquiera
  □ Zona horaria: Spain (Madrid)
  □ Verificar email

Crear calendario para demos:
  □ Click "Create New Event Type"
  □ Nombre: "Demo Oportunidades Públicas"
  □ Duración: 15 minutos
  □ Descripción: "Demostramos cómo funciona la plataforma"
  □ Buscar disponibilidad:
    - Lunes-Viernes: 10:00-18:00
  □ Save

Obtener URL:
  □ Copiar URL del evento (ej: https://calendly.com/salva/demo)
  □ Guardar (la necesitarás en contacto.html)

Resultado esperado:
  ✅ Calendly configurado
  ✅ URL de demo guardada
```

---

## 🌐 FASE 3: DEPLOYMENT (2-3 horas)

### PASO 8: Deploy Frontend a Netlify ⏱️ 30 MIN
```
Ir a: https://app.netlify.com/

Proceso:
  □ Click "Sign up"
  □ Signup con GitHub (más fácil)
  □ Autorizar Netlify acceso a GitHub

Después:
  □ Click "New site from Git"
  □ Seleccionar GitHub
  □ Buscar: "oportunidades-publicas"
  □ Seleccionar el repo

Configurar deploy:
  □ Branch to deploy: main
  □ Build command: (dejar vacío)
  □ Publish directory: . (punto, raíz del repo)
  □ Click "Deploy site"
  □ ESPERAR 2-3 minutos

Después del deploy:
  □ Ir a Site settings
  □ Custom domain:
    - Click "Add custom domain"
    - Dominio: licitacionespublicas.es
    - Click "Verify"
    - Sigue instrucciones para actualizar DNS

Actualizar DNS (en tu registrador de dominio):
  □ Ir a Namecheap/GoDaddy
  □ Tu dominio → DNS settings
  □ Cambiar nameservers a:
    - dns1.p06.netlify.com
    - dns2.p06.netlify.com
    - dns3.p06.netlify.com
  □ Guardar cambios
  □ ESPERAR 24 horas para propagación

Resultado esperado:
  ✅ Frontend en línea en https://licitacionespublicas.es
  ✅ Todos los archivos HTML accesibles
```

### PASO 9: Deploy Backend a Railway ⏱️ 30 MIN
```
Ir a: https://railway.app/

Proceso:
  □ Click "Login with GitHub"
  □ Autorizar Railway
  □ Click "New Project"
  □ Seleccionar "Deploy from GitHub repo"
  □ Seleccionar repo "oportunidades-publicas"
  □ Seleccionar branch "main"
  □ Seleccionar directorio: "backend"

Configurar variables de entorno:
  □ En Railway, ir a "Variables"
  □ Agregar todas estas (de tus credenciales guardadas):
    
    SUPABASE_URL=https://xxxxx.supabase.co
    SUPABASE_KEY=eyJxxx... (anon public key)
    SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
    
    CREEM_API_KEY=xxxx-xxxx-xxxx
    CREEM_MERCHANT_ID=xxxx
    CREEM_WEBHOOK_SECRET=xxxx
    
    JWT_SECRET=tu-secret-super-largo-aqui (genera algo fuerte)
    NODE_ENV=production
    PORT=3001
    
    SENDGRID_API_KEY=SG.xxxx-xxxx-xxxx

  □ Click "Deploy"
  □ ESPERAR 5-10 minutos

Después del deploy:
  □ Railway te dará URL: https://xxxxx.railway.app
  □ Test endpoint: https://xxxxx.railway.app/api/health
  □ Deberías ver: {"status":"OK"}

Resultado esperado:
  ✅ Backend en línea en https://xxxx.railway.app
  ✅ API endpoints funcionales
```

### PASO 10: Conectar Frontend ↔ Backend ⏱️ 15 MIN
```
En tu código (frontend):

Buscar todos los archivos que hacen fetch:
  - dashboard-profesional.html
  - 02-busqueda-resultados.html
  - etc.

Reemplazar:
  DE: fetch('http://localhost:3001/api/...')
  A:  fetch('https://tu-backend-url.railway.app/api/...')

Alternativa: Crear archivo .env.js
  
  En /outputs/config.js:
  ```
  const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://tu-backend-url.railway.app'
    : 'http://localhost:3001';
  ```

  Luego en cada HTML:
  ```
  <script src="config.js"></script>
  <script>
    fetch(API_URL + '/api/health')...
  </script>
  ```

Git push:
  git add .
  git commit -m "Connect frontend to production backend"
  git push origin main

  Netlify auto-redeploy en 1-2 minutos

Resultado esperado:
  ✅ Frontend conectado a backend
  ✅ API calls funcionando
```

---

## 📸 FASE 4: PERSONAL BRANDING (30 MIN)

### PASO 11: Fotos del Equipo ⏱️ 30 MIN
```
Para about-us.html necesitas fotos de:
  □ Salva Vázquez (CEO)
  □ Carlos Álvarez (Legal)
  □ Laura Serrano (Support)

Opciones:
  1. REAL: Toma fotos con celular en lugar profesional
     - Fondo neutro (pared blanca/gris)
     - Luz natural
     - Foto desde hombros hacia arriba
     - Guarda como PNG o JPG

  2. AI (si no tienes fotos):
     - Ir a https://thispersondoesnotexist.com/ (generar cara IA)
     - O https://app.midjourney.com/ (si tienes acceso)
     - Generar: "professional business person, headshot, blurred background"

Guardar fotos:
  □ Crear carpeta: /outputs/images/team/
  □ Guardar como:
    - salva-vazquez.jpg
    - carlos-alvarez.jpg
    - laura-serrano.jpg
  
Actualizar about-us.html:
  □ Reemplazar divs:
    ```
    <div class="team-photo">👨‍💼</div>
    ```
    Con:
    ```
    <div class="team-photo">
      <img src="/images/team/salva-vazquez.jpg" alt="Salva Vázquez">
    </div>
    ```

Resultado esperado:
  ✅ Fotos del equipo en about-us
  ✅ About más creíble y profesional
```

---

## 🧪 FASE 5: TESTING (1 hora)

### PASO 12: Test Everything ⏱️ 60 MIN
```
En tu navegador (Chrome preferiblemente):

[ ] LANDING
  □ Abrir https://licitacionespublicas.es
  □ Ver landing muestra correctamente
  □ Click "EMPEZAR GRATIS" → va a registro
  □ Video se reproduce (si lo agregaste)
  □ Countdown urgencia anima

[ ] PRICING
  □ Ir a /pricing
  □ Ver 3 planes
  □ Toggle anual/mensual funciona
  □ Click "Empezar" va a registro

[ ] ABOUT US
  □ Ir a /about-us
  □ Ver equipo con fotos
  □ Stats visibles
  □ Links funcionan

[ ] DEMO
  □ Ir a /demo
  □ Click pasos del tour
  □ Cada paso muestra contenido diferente
  □ CTA al final funciona

[ ] CONTACTO
  □ Ir a /contacto
  □ Formulario rellena
  □ Click enviar: alerta confirma
  □ Link Calendly abre: abre calendly.com
  □ Email visible: soporte@licitacionespublicas.es

[ ] BLOG
  □ Ir a /blog
  □ Ver 3 artículos
  □ Click filtros funciona
  □ Click artículo abre (si está en href)

[ ] HELP
  □ Ir a /help
  □ Ver categorías
  □ Click FAQ expand/collapse
  □ Links a getting-started funcionan

[ ] RESPONSIVE
  □ F12 → Device toolbar
  □ Ver en mobile (375px)
  □ Ver en tablet (768px)
  □ Todo se adapta correctamente

[ ] PERFORMANCE
  □ F12 → Lighthouse
  □ Score debe ser 80+
  □ Si está bajo:
    - Optimizar imágenes
    - Minify CSS/JS
    - Lazy load assets

[ ] BACKEND
  □ Abrir console (F12)
  □ Cualquier API call debería ir a tu backend
  □ No debería haber errores CORS

Resultado esperado:
  ✅ Todo funciona sin errores
  ✅ Landing → Pricing → About → Demo fluye natural
  ✅ Mobile responsive
  ✅ Performance OK
```

---

## 📊 FASE 6: ANALYTICS & MONITORING (30 MIN)

### PASO 13: Setup Google Analytics ⏱️ 20 MIN
```
Ir a: https://analytics.google.com/

Proceso:
  □ Click "Create account"
  □ Account name: "Oportunidades Públicas"
  □ Property name: "Web"
  □ Website URL: https://licitacionespublicas.es
  □ Timezone: Europe/Madrid
  □ Create

Después:
  □ Te dará código de tracking (GA4)
  □ Copiar código JavaScript
  □ Pegar en TODAS tus páginas HTML (en <head>):
    
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXX');
    </script>

  □ Reemplazar G-XXXXX con tu ID real

Git push:
  git add .
  git commit -m "Add Google Analytics tracking"
  git push origin main

Verificar:
  □ Abrir Analytics Dashboard
  □ Ir a Realtime
  □ Abrir tu sitio en otra ventana
  □ Deberías ver usuarios activos

Resultado esperado:
  ✅ Google Analytics tracking funcionando
  ✅ Puedes ver visitors en tiempo real
```

### PASO 14: Setup Hotjar (Heatmaps) ⏱️ 10 MIN
```
Ir a: https://www.hotjar.com/

Proceso:
  □ Click "Sign up"
  □ Email: tu email
  □ Website: licitacionespublicas.es
  □ Create account

Después:
  □ Te dará código tracking
  □ Copiar y pegar en <head> de todas las páginas

Resultado esperado:
  ✅ Puedes ver donde hacen click los usuarios
  ✅ Heatmaps de scrolling
```

---

## 🎉 FASE 7: GO LIVE! (1-2 horas)

### PASO 15: Final Checks & Launch ⏱️ 30 MIN
```
Antes de lanzar:

[ ] Dominio DNS propague (24-48h después de cambiar)
[ ] Frontend en Netlify: https://licitacionespublicas.es
[ ] Backend en Railway: https://xxxx.railway.app/api/health
[ ] Supabase con datos (schema cargado)
[ ] CREEM cuenta activa
[ ] SendGrid verificado
[ ] Calendly URL insertada en contacto.html
[ ] GA4 código en todas las páginas
[ ] Hotjar código en páginas principales
[ ] Tests pasados ✅
[ ] Fotos del equipo en about.html
[ ] Links internos funcionan
[ ] Mobile responsive OK
[ ] Performance score 80+

FINAL:
[ ] Enviar email a:
    - Primeros 10-20 amigos
    - Colegas del sector
    - Contactos empresa
    
    Asunto: "Te muestro algo que hemos estado construyendo..."
    Contenido: Landing link + "Dame feedback"

[ ] Publicar en LinkedIn:
    "Hoy lanzamos Oportunidades Públicas 🚀
    
    Un proyecto que empezó como 'no puede ser tan difícil 
    encontrar subvenciones...' y terminó en esto:
    
    ✅ 56 páginas HTML
    ✅ Backend completamente automatizado
    ✅ €8.5B en subvenciones indexadas
    ✅ Listo para cambiar cómo las PYMES acceden a financiación
    
    Prueba aquí: licitacionespublicas.es (gratis, sin tarjeta)
    
    Todo feedback bienvenido 🙏"

[ ] Monitorea:
    - Conversión (Google Analytics)
    - Clicks (Hotjar)
    - Errores (Railway logs, Netlify logs)
    - Chat (soporte)

Resultado esperado:
  ✅ 🚀 LANZAMIENTO OFICIAL
  ✅ Primeros usuarios empiezan a registrarse
  ✅ Datos empiezan a fluir a Analytics
```

---

## 📋 RESUMEN CHECKLIST FINAL

```
INFRAESTRUCTURA:
  [✓] Dominio registrado
  [✓] GitHub repo creado
  [✓] Código pusheado
  
SERVICIOS:
  [✓] Supabase BD creada + schema
  [✓] CREEM merchant account
  [✓] SendGrid cuenta + API key
  [✓] Calendly configurado
  
DEPLOYMENT:
  [✓] Frontend en Netlify
  [✓] Backend en Railway
  [✓] DNS configurado
  [✓] Frontend ↔ Backend conectado
  
CONTENIDO:
  [✓] Fotos del equipo
  [✓] Calendly URL en contacto.html
  [✓] GA4 código en todas las páginas
  
TESTING:
  [✓] Landing → Pricing → About → Demo
  [✓] Registro funciona
  [✓] API calls funcionan
  [✓] Mobile responsive
  [✓] Performance OK
  
FINAL:
  [✓] Email a primeros usuarios
  [✓] Post en LinkedIn
  [✓] Monitoreo activo
  [✓] 🚀 LIVE!
```

---

## 💡 TIEMPO ESTIMADO POR PASO

```
Paso 1  (Dominio):              15 min
Paso 2  (GitHub):               10 min
Paso 3  (Git push):             30 min
Paso 4  (Supabase):             20 min
Paso 5  (CREEM):                30 min
Paso 6  (SendGrid):             20 min
Paso 7  (Calendly):             10 min
Paso 8  (Netlify):              30 min
Paso 9  (Railway):              30 min
Paso 10 (Conectar):             15 min
Paso 11 (Fotos):                30 min
Paso 12 (Testing):              60 min
Paso 13 (GA4):                  20 min
Paso 14 (Hotjar):               10 min
Paso 15 (Launch):               30 min

TOTAL: 9-10 horas

Mejor hacerlo en 2 días:
  DÍA 1: Pasos 1-7 (infraestructura + servicios)
  DÍA 2: Pasos 8-15 (deployment + testing + launch)
```

---

## 🆘 SI ALGO FALLA

```
Error "DNS not propagated":
  → Esperar 24-48h, es normal
  
Error "CORS from backend":
  → Verificar que backend está en Railway
  → Verificar que BASE_URL en frontend es correcto
  
Error "Supabase connection":
  → Verificar credenciales en .env backend
  → Verificar que schema.sql ejecutó sin errores
  
Error "Analytics no funciona":
  → Verificar que código GA4 está en TODAS las páginas
  → Check F12 console si hay errores
  
Error "Formulario no envía":
  → Verificar SendGrid API key
  → Verificar email template existe

CONTACTA A CLAUDE si algo no funciona ✅
```

---

**¡VAMOS SALVA! A POR LOS PRIMEROS CLIENTES 🚀**

Empieza por el PASO 1 (dominio) cuando estés listo.
Avísame cuando termines cada fase.

