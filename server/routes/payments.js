import { Router } from 'express';
import db from '../db.js';
import { attachUser } from '../auth.js';
import { stripe, stripeEnabled, stripeLive, publishableKey } from '../stripe.js';

const router = Router();

function appUrl() {
  let url = (process.env.APP_URL || 'http://localhost:3000').trim().replace(/\/$/, '');
  // Some hosts (e.g. Render) expose the bare hostname — ensure a scheme is present.
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  return url;
}

// Tells the frontend which payment mode is active.
router.get('/config', (_req, res) => {
  res.json({
    enabled: stripeEnabled,
    live: stripeLive,
    mode: stripeEnabled ? (stripeLive ? 'live' : 'test') : 'demo',
    publishableKey: publishableKey(),
    currency: (process.env.CURRENCY || 'usd').toLowerCase(),
  });
});

// Create a checkout session for a given service.
router.post('/checkout', attachUser, async (req, res) => {
  const { service_id, email } = req.body || {};
  const service = db.prepare('SELECT * FROM services WHERE id = ? AND active = 1').get(service_id);
  if (!service) return res.status(404).json({ error: 'الخدمة غير متوفرة' });

  const payerEmail = (req.user && req.user.email) || email;
  if (!payerEmail) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب لإتمام الدفع' });

  const payment = db.prepare(`
    INSERT INTO payments (user_id, service_id, email, amount_cents, currency, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).run(
    req.user ? req.user.id : null,
    service.id,
    payerEmail,
    service.price_cents,
    service.currency
  );
  const paymentId = payment.lastInsertRowid;

  // ── REAL Stripe Checkout ──────────────────────────────────
  if (stripeEnabled) {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: payerEmail,
        line_items: [{
          price_data: {
            currency: service.currency,
            unit_amount: service.price_cents,
            product_data: {
              name: `Skyline — ${service.title_en}`,
              description: service.summary_en,
            },
          },
          quantity: 1,
        }],
        metadata: { payment_id: String(paymentId), service_id: String(service.id) },
        success_url: `${appUrl()}/payment-success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl()}/services.html?canceled=1`,
      });
      db.prepare('UPDATE payments SET session_id = ? WHERE id = ?').run(session.id, paymentId);
      return res.json({ mode: 'stripe', url: session.url });
    } catch (err) {
      console.error('Stripe error:', err.message);
      db.prepare("UPDATE payments SET status = 'failed' WHERE id = ?").run(paymentId);
      return res.status(502).json({ error: 'تعذّر إنشاء جلسة الدفع، حاول لاحقاً' });
    }
  }

  // ── DEMO mode (no Stripe keys configured) ─────────────────
  const demoSession = `demo_${paymentId}_${Date.now()}`;
  db.prepare('UPDATE payments SET session_id = ? WHERE id = ?').run(demoSession, paymentId);
  return res.json({
    mode: 'demo',
    url: `/payment-demo.html?pid=${paymentId}&amount=${service.price_cents}&currency=${service.currency}&title=${encodeURIComponent(service.title_ar)}`,
  });
});

// Demo confirmation endpoint — only usable while Stripe is not configured.
router.post('/demo/confirm', (req, res) => {
  if (stripeEnabled) return res.status(400).json({ error: 'Stripe مفعّل — وضع المحاكاة معطّل' });
  const { payment_id } = req.body || {};
  const p = db.prepare('SELECT * FROM payments WHERE id = ?').get(payment_id);
  if (!p) return res.status(404).json({ error: 'عملية الدفع غير موجودة' });
  db.prepare("UPDATE payments SET status = 'paid', provider = 'demo' WHERE id = ?").run(p.id);
  res.json({ ok: true, reference: `PAY-${String(p.id).padStart(6, '0')}` });
});

// Verify a completed Stripe session (called by the success page).
router.get('/verify', async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'معرّف الجلسة مطلوب' });

  const payment = db.prepare('SELECT * FROM payments WHERE session_id = ?').get(session_id);
  if (!payment) return res.status(404).json({ error: 'العملية غير موجودة' });

  if (stripeEnabled) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status === 'paid' && payment.status !== 'paid') {
        db.prepare("UPDATE payments SET status = 'paid' WHERE id = ?").run(payment.id);
        payment.status = 'paid';
      }
    } catch (err) {
      console.error('Verify error:', err.message);
    }
  }

  res.json({
    status: payment.status,
    amount_cents: payment.amount_cents,
    currency: payment.currency,
    reference: `PAY-${String(payment.id).padStart(6, '0')}`,
  });
});

export default router;

// Stripe webhook handler — mounted separately in index.js so it can use the raw body.
export async function stripeWebhook(req, res) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  let event = req.body;

  if (stripeEnabled && secret) {
    const sig = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, secret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const pid = session.metadata && session.metadata.payment_id;
    if (pid) {
      db.prepare("UPDATE payments SET status = 'paid' WHERE id = ?").run(pid);
    } else if (session.id) {
      db.prepare("UPDATE payments SET status = 'paid' WHERE session_id = ?").run(session.id);
    }
  }
  res.json({ received: true });
}
