import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import catalogRoutes from './routes/catalog.js';
import applicationRoutes from './routes/applications.js';
import paymentRoutes, { stripeWebhook } from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import { stripeEnabled, stripeLive } from './stripe.js';
import { attachUser } from './auth.js';
import './seed.js'; // ensures DB is seeded on first boot

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
app.set('trust proxy', 1);

// Stripe webhook needs the RAW body — must come before express.json().
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://js.stripe.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      frameSrc: ['https://js.stripe.com', 'https://hooks.stripe.com'],
      connectSrc: ["'self'", 'https://api.stripe.com'],
    },
  },
}));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(attachUser); // populates req.user from the JWT cookie/header for every route

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api', apiLimiter, catalogRoutes);
app.use('/api/applications', apiLimiter, applicationRoutes);
app.use('/api/payments', apiLimiter, paymentRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, payments: stripeEnabled ? (stripeLive ? 'live' : 'test') : 'demo' });
});

// Static frontend
app.use(express.static(path.join(__dirname, '..', 'public'), { extensions: ['html'] }));

app.use((_req, res) => res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html')));

app.listen(PORT, () => {
  const mode = stripeEnabled ? (stripeLive ? 'LIVE 💳 (real money)' : 'TEST 🧪 (Stripe test cards)') : 'DEMO 🧩 (no Stripe keys)';
  console.log(`\n  ✈  Skyline Immigration Portal`);
  console.log(`  ➜  http://localhost:${PORT}`);
  console.log(`  ➜  Payment gateway: ${mode}\n`);
});
