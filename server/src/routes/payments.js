import { Router } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// Server-defined plan prices (never trust a client-supplied amount)
const PLAN_PRICES = {
  basic: 999,   // $9.99
  pro: 2999,    // $29.99
};

router.post('/create-intent', requireAuth, async (req, res, next) => {
  try {
    const { plan } = req.body;
    const amount = PLAN_PRICES[plan];

    if (!amount) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const user = await prisma.user.upsert({
      where: { firebaseUid: req.user.uid },
      update: {},
      create: { firebaseUid: req.user.uid, email: req.user.email || `${req.user.uid}@unknown.local` },
    });

    const intent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { userId: user.id, plan },
      automatic_payment_methods: { enabled: true },
    });

    await prisma.payment.create({
      data: {
        userId: user.id,
        stripePaymentIntentId: intent.id,
        amount,
        status: 'pending',
      },
    });

    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    next(err);
  }
});

// Stripe webhook — the source of truth for payment status.
// Never trust the client-side redirect alone; Stripe confirms server-to-server.
// Mounted with express.raw() in index.js (signature verification needs the raw body).
export async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature verification failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object;
    const status = event.type === 'payment_intent.succeeded' ? 'succeeded' : 'failed';

    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: intent.id },
      data: { status },
    });
  }

  res.json({ received: true });
}

export default router;