# Onboarding Demo — Server

Express API backing the onboarding quiz flow. Verifies Firebase Auth tokens, stores quiz answers and payment records in Neon Postgres via Prisma, and creates Stripe payment intents.

## Stack
- Express (long-running server, not serverless — see ORM note below)
- Prisma ORM → Neon (Postgres)
- Firebase Admin SDK (verifies client-issued ID tokens)
- Stripe (server-side payment intents)

## Setup
```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, FIREBASE_SERVICE_ACCOUNT, STRIPE_SECRET_KEY
npx prisma migrate dev --name init
npm run dev
```

## Why Prisma here
This runs as a long-running Express server (not serverless functions), so Prisma's
query-engine cold-start cost doesn't apply — it initializes once per process.
Drizzle would be the better call if this were deployed as Vercel/Lambda functions.

## Endpoints
- `GET /health` — liveness check
- `POST /api/quiz/answers` — upsert one quiz step's answer (auth required)
- `GET /api/quiz/answers` — fetch saved answers, for resuming the flow (auth required)
- `POST /api/payments/create-intent` — create a Stripe PaymentIntent for a plan (auth required)

## Auth
All protected routes expect `Authorization: Bearer <Firebase ID token>`.