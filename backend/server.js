const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const stripe = require('stripe');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Initialize Stripe
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Brevo (SendinBlue)
const brevoApiKey = process.env.BREVO_API_KEY;

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'API Oportunidades Públicas Online',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, company } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Insert user in Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email,
        password: Buffer.from(password).toString('base64'), // Basic encoding - use bcrypt in production
        name,
        company,
        plan: 'free',
        created_at: new Date()
      }])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Send welcome email via Brevo
    await axios.post('https://api.brevo.com/v3/smtp/email', {
      to: [{ email, name }],
      sender: { name: 'Oportunidades Públicas', email: 'noreply@oportunidadespublicas.es' },
      subject: '¡Bienvenido a Oportunidades Públicas!',
      htmlContent: `<h1>Bienvenido ${name}</h1><p>Tu cuenta ha sido creada. Comienza a buscar subvenciones ahora.</p>`
    }, {
      headers: { 'api-key': brevoApiKey }
    }).catch(e => console.log('Email no enviado (no crítico)', e.message));

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: data[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Basic password check (use bcrypt in production)
    const storedPassword = Buffer.from(data.password, 'base64').toString();
    if (storedPassword !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      success: true,
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        plan: data.plan
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SOLICITATIONS ENDPOINTS
// ============================================

// Get all solicitations for a user
app.get('/api/solicitations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('solicitations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      count: data.length,
      solicitations: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new solicitation
app.post('/api/solicitations', async (req, res) => {
  try {
    const { user_id, title, description, amount, deadline } = req.body;

    const { data, error } = await supabase
      .from('solicitations')
      .insert([{
        user_id,
        title,
        description,
        amount,
        deadline,
        status: 'draft',
        created_at: new Date()
      }])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      success: true,
      solicitation: data[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// STRIPE PAYMENT ENDPOINTS
// ============================================

// Create checkout session for premium plan
app.post('/api/payments/checkout', async (req, res) => {
  try {
    const { email, plan } = req.body;

    const prices = {
      'basico': 1900,    // €19/mes
      'profesional': 5900, // €59/mes
      'premium': 14900   // €149/mes
    };

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Plan ${plan.charAt(0).toUpperCase() + plan.slice(1)} - Oportunidades Públicas`,
            },
            unit_amount: prices[plan] || 1900,
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      customer_email: email,
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook for Stripe
app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripeClient.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Update user plan in Supabase
      const { error } = await supabase
        .from('users')
        .update({ plan: 'premium', updated_at: new Date() })
        .eq('email', session.customer_email);

      if (error) console.error('Error updating user:', error);
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// ============================================
// EMAIL ENDPOINTS
// ============================================

// Send email via Brevo
app.post('/api/email/send', async (req, res) => {
  try {
    const { to, subject, htmlContent } = req.body;

    const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
      to: [{ email: to }],
      sender: { name: 'Oportunidades Públicas', email: 'noreply@oportunidadespublicas.es' },
      subject,
      htmlContent
    }, {
      headers: { 'api-key': brevoApiKey }
    });

    res.json({
      success: true,
      messageId: response.data.messageId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`✅ Oportunidades Públicas API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
