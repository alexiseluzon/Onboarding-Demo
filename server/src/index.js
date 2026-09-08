import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import quizRoutes from './routes/quiz.js';
import paymentRoutes, { handleStripeWebhook } from './routes/payments.js';

const app = express();
const PORT = process.env.PORT || 4000;

// CORS: only allow the configured frontend origin (Vercel deployment)
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));

// Stripe webhook needs the raw body for signature verification —
// must be mounted BEFORE express.json() and outside /api/payments router.
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(express.json({ limit: '100kb' })); // cap body size, basic hardening

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/quiz', quizRoutes);
app.use('/api/payments', paymentRoutes);

// Centralized error handler — never leak stack traces to client
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.publicMessage || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});