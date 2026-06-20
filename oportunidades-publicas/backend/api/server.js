// ============================================
// OPORTUNIDADES PÚBLICAS - API SERVER
// ============================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json());

// ============================================
// SUPABASE CLIENT
// ============================================

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// ============================================
// AUTH MIDDLEWARE
// ============================================

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error) throw error;
        
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// ============================================
// AUTH ENDPOINTS
// ============================================

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, full_name, company_name } = req.body;

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password
        });

        if (authError) throw authError;

        // Create user profile
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert([{
                id: authData.user.id,
                email,
                full_name,
                company_name
            }])
            .select();

        if (userError) throw userError;

        res.json({
            user: userData[0],
            session: authData.session
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        res.json({ session: data.session });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// Logout
app.post('/api/auth/logout', verifyToken, async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// USER ENDPOINTS
// ============================================

// Get user profile
app.get('/api/users/me', verifyToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*, user_profiles(*), subscriptions(*)')
            .eq('id', req.user.id)
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update user profile
app.put('/api/users/me', verifyToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .update(req.body)
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// SUBSCRIPTION ENDPOINTS
// ============================================

// Get subscription
app.get('/api/subscriptions', verifyToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.json(data || null);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create subscription
app.post('/api/subscriptions', verifyToken, async (req, res) => {
    try {
        const { plan } = req.body;

        const { data, error } = await supabase
            .from('subscriptions')
            .insert([{
                user_id: req.user.id,
                plan,
                status: 'active',
                current_period_start: new Date(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }])
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Cancel subscription
app.post('/api/subscriptions/cancel', verifyToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .update({ status: 'cancelled' })
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// SOLICITUDES ENDPOINTS
// ============================================

// Get all solicitudes
app.get('/api/solicitudes', verifyToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('solicitudes')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create solicitud
app.post('/api/solicitudes', verifyToken, async (req, res) => {
    try {
        const { title, description, entity_name, amount_requested, deadline_date } = req.body;

        const { data, error } = await supabase
            .from('solicitudes')
            .insert([{
                user_id: req.user.id,
                title,
                description,
                entity_name,
                amount_requested,
                deadline_date,
                status: 'draft'
            }])
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update solicitud
app.put('/api/solicitudes/:id', verifyToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('solicitudes')
            .update(req.body)
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// SEARCH ENDPOINTS
// ============================================

// Search solicitudes
app.get('/api/search', verifyToken, async (req, res) => {
    try {
        const { query, sector, region } = req.query;

        let queryBuilder = supabase
            .from('bdns_cache')
            .select('*');

        if (query) {
            queryBuilder = queryBuilder.ilike('title', `%${query}%`);
        }
        if (sector) {
            queryBuilder = queryBuilder.eq('sector', sector);
        }
        if (region) {
            queryBuilder = queryBuilder.eq('region', region);
        }

        const { data, error } = await queryBuilder
            .order('deadline_date', { ascending: false })
            .limit(50);

        if (error) throw error;

        // Log search
        await supabase
            .from('search_requests')
            .insert([{
                user_id: req.user.id,
                query,
                filters: { sector, region },
                results_count: data.length
            }]);

        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

