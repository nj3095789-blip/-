import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;

// When real Stripe keys are present we use the genuine payment gateway.
// When absent, the portal runs in DEMO mode so the full flow stays testable
// without leaking secrets — flip to real money simply by adding the keys.
export const stripeEnabled = Boolean(key && key.startsWith('sk_'));
export const stripeLive = Boolean(key && key.startsWith('sk_live_'));

export const stripe = stripeEnabled ? new Stripe(key) : null;

export function publishableKey() {
  return process.env.STRIPE_PUBLISHABLE_KEY || '';
}
