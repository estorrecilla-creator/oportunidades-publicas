// ============================================
// CREEM PAYMENT INTEGRATION
// ============================================

const axios = require('axios');

const CREEM_API = axios.create({
    baseURL: process.env.CREEM_API_URL || 'https://api.creem.es/v1',
    headers: {
        'Authorization': `Bearer ${process.env.CREEM_API_KEY}`,
        'Content-Type': 'application/json'
    }
});

// ============================================
// CREATE PAYMENT
// ============================================

exports.createPayment = async (paymentData) => {
    try {
        const payload = {
            amount: paymentData.amount * 100, // Convert to cents
            currency: 'EUR',
            description: paymentData.description,
            customer: {
                email: paymentData.email,
                name: paymentData.name
            },
            metadata: {
                user_id: paymentData.user_id,
                subscription_id: paymentData.subscription_id
            },
            return_url: paymentData.return_url,
            webhook_url: `${process.env.API_URL}/webhooks/creem`
        };

        const response = await CREEM_API.post('/payments', payload);

        return {
            success: true,
            payment_id: response.data.id,
            checkout_url: response.data.checkout_url,
            expires_at: response.data.expires_at
        };
    } catch (error) {
        console.error('CREEM Payment Error:', error.response?.data || error.message);
        throw new Error(`Payment creation failed: ${error.message}`);
    }
};

// ============================================
// GET PAYMENT STATUS
// ============================================

exports.getPaymentStatus = async (paymentId) => {
    try {
        const response = await CREEM_API.get(`/payments/${paymentId}`);

        return {
            payment_id: response.data.id,
            status: response.data.status, // "pending", "completed", "failed"
            amount: response.data.amount / 100,
            completed_at: response.data.completed_at
        };
    } catch (error) {
        console.error('Get Payment Error:', error.message);
        throw error;
    }
};

// ============================================
// REFUND PAYMENT
// ============================================

exports.refundPayment = async (paymentId, amount) => {
    try {
        const payload = {
            amount: amount ? amount * 100 : null // null = full refund
        };

        const response = await CREEM_API.post(
            `/payments/${paymentId}/refund`,
            payload
        );

        return {
            success: true,
            refund_id: response.data.id,
            refunded_amount: response.data.amount / 100
        };
    } catch (error) {
        console.error('Refund Error:', error.message);
        throw error;
    }
};

// ============================================
// WEBHOOK HANDLER
// ============================================

exports.handleWebhook = async (event) => {
    const supabase = require('../api/supabase');

    try {
        switch (event.type) {
            case 'payment.completed':
                // Update payment status
                await supabase
                    .from('invoices')
                    .update({
                        status: 'paid',
                        paid_at: new Date(),
                        stripe_invoice_id: event.data.id
                    })
                    .eq('stripe_invoice_id', event.data.id);

                // Activate subscription
                const invoice = await supabase
                    .from('invoices')
                    .select('subscription_id')
                    .eq('stripe_invoice_id', event.data.id)
                    .single();

                if (invoice.data) {
                    await supabase
                        .from('subscriptions')
                        .update({ status: 'active' })
                        .eq('id', invoice.data.subscription_id);
                }
                break;

            case 'payment.failed':
                // Update payment status
                await supabase
                    .from('invoices')
                    .update({ status: 'failed' })
                    .eq('stripe_invoice_id', event.data.id);

                // Send notification to user
                // TODO: Send email/notification
                break;

            default:
                console.log('Unknown webhook event:', event.type);
        }
    } catch (error) {
        console.error('Webhook handler error:', error);
        throw error;
    }
};

// ============================================
// CREATE RECURRING SUBSCRIPTION
// ============================================

exports.createRecurringSubscription = async (subscriptionData) => {
    try {
        const payload = {
            plan: subscriptionData.plan, // "basic", "professional", "premium"
            email: subscriptionData.email,
            name: subscriptionData.name,
            metadata: {
                user_id: subscriptionData.user_id
            }
        };

        const response = await CREEM_API.post('/subscriptions', payload);

        return {
            success: true,
            subscription_id: response.data.id,
            status: response.data.status,
            next_billing_date: response.data.next_billing_date
        };
    } catch (error) {
        console.error('Subscription creation error:', error.message);
        throw error;
    }
};

