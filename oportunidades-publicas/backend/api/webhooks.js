// ============================================
// WEBHOOK HANDLERS
// ============================================

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const router = express.Router();
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================
// CREEM PAYMENT WEBHOOK
// ============================================

router.post('/creem', async (req, res) => {
    try {
        const { event, data } = req.body;

        // Verify signature
        const signature = req.headers['x-creem-signature'];
        const expectedSignature = crypto
            .createHmac('sha256', process.env.CREEM_WEBHOOK_SECRET)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (signature !== expectedSignature) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        console.log(`📩 Webhook event: ${event}`);

        switch (event) {
            case 'payment.completed':
                await handlePaymentCompleted(data);
                break;

            case 'payment.failed':
                await handlePaymentFailed(data);
                break;

            case 'refund.completed':
                await handleRefundCompleted(data);
                break;

            case 'subscription.renewed':
                await handleSubscriptionRenewed(data);
                break;

            default:
                console.log('Unknown event:', event);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// PAYMENT HANDLERS
// ============================================

async function handlePaymentCompleted(data) {
    try {
        const { id, metadata, amount } = data;

        // Update invoice status
        await supabase
            .from('invoices')
            .update({
                status: 'paid',
                paid_at: new Date(),
                stripe_invoice_id: id
            })
            .eq('stripe_invoice_id', id);

        // Activate subscription
        const { data: invoice } = await supabase
            .from('invoices')
            .select('subscription_id')
            .eq('stripe_invoice_id', id)
            .single();

        if (invoice?.subscription_id) {
            await supabase
                .from('subscriptions')
                .update({ status: 'active' })
                .eq('id', invoice.subscription_id);
        }

        // Send confirmation email
        await sendPaymentConfirmationEmail(metadata.user_id, amount);

        // Create notification
        await supabase
            .from('notifications')
            .insert([{
                user_id: metadata.user_id,
                type: 'payment_completed',
                title: 'Pago procesado',
                message: `Hemos recibido tu pago de €${(amount / 100).toFixed(2)}`,
                read: false
            }]);

        console.log(`✅ Payment completed: ${id}`);
    } catch (error) {
        console.error('Error handling payment:', error);
        throw error;
    }
}

async function handlePaymentFailed(data) {
    try {
        const { id, metadata, reason } = data;

        // Update invoice status
        await supabase
            .from('invoices')
            .update({
                status: 'failed'
            })
            .eq('stripe_invoice_id', id);

        // Send error email
        await sendPaymentFailureEmail(metadata.user_id, reason);

        // Create notification
        await supabase
            .from('notifications')
            .insert([{
                user_id: metadata.user_id,
                type: 'payment_failed',
                title: '⚠️ Error en el pago',
                message: `Motivo: ${reason}. Reintentaremos en 3 días.`,
                read: false
            }]);

        console.log(`❌ Payment failed: ${id} - ${reason}`);
    } catch (error) {
        console.error('Error handling failed payment:', error);
        throw error;
    }
}

async function handleRefundCompleted(data) {
    try {
        const { id, metadata, amount } = data;

        // Update invoice
        await supabase
            .from('invoices')
            .update({
                status: 'refunded'
            })
            .eq('stripe_invoice_id', id);

        // Send refund email
        await sendRefundEmail(metadata.user_id, amount);

        console.log(`💰 Refund completed: ${id}`);
    } catch (error) {
        console.error('Error handling refund:', error);
        throw error;
    }
}

async function handleSubscriptionRenewed(data) {
    try {
        const { id, metadata } = data;

        // Update subscription period
        await supabase
            .from('subscriptions')
            .update({
                current_period_start: new Date(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            })
            .eq('stripe_subscription_id', id);

        console.log(`🔄 Subscription renewed: ${id}`);
    } catch (error) {
        console.error('Error handling subscription renewal:', error);
        throw error;
    }
}

// ============================================
// EMAIL HANDLERS (PLACEHOLDER)
// ============================================

async function sendPaymentConfirmationEmail(userId, amount) {
    // TODO: Integrate SendGrid
    console.log(`📧 Send confirmation email to user ${userId}`);
}

async function sendPaymentFailureEmail(userId, reason) {
    // TODO: Integrate SendGrid
    console.log(`📧 Send failure email to user ${userId}`);
}

async function sendRefundEmail(userId, amount) {
    // TODO: Integrate SendGrid
    console.log(`📧 Send refund email to user ${userId}`);
}

// ============================================
// STRIPE WEBHOOK (ALTERNATIVE)
// ============================================

router.post('/stripe', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
        const event = require('stripe').webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event.data.object);
                break;

            case 'charge.failed':
                await handleChargeFailed(event.data.object);
                break;
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Stripe webhook error:', error);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
});

module.exports = router;
