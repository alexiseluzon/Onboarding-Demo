# Onboarding Demo

Full-stack demo built for the "React + Node Developer — Onboarding Quiz Flow"
role (Firebase Auth + Stripe + existing Node API). Matches the JD's required
stack end to end.

## Stack
| Layer      | Tech                                              |
|------------|---------------------------------------------------|
| Frontend   | Vite + React + React Router                       |
| Auth       | Firebase Auth (email/password + Google SSO)        |
| Backend    | Node.js + Express                                  |
| ORM/DB     | Prisma → Neon (Postgres)                           |
| Payments   | Stripe Elements + PaymentIntents + webhook         |
| CRM        | HubSpot contact push (nice-to-have, non-blocking)  |
| Hosting    | Vercel (frontend) / Render (backend)                |
| Testing    | Jest, Supertest, Playwright                        |
| CI/CD      | GitHub Actions + Husky pre-commit                   |

## Structure
```
onboarding-demo/
├── .github/workflows/ci.yml
├── .husky/pre-commit
├── package.json          # root — Husky only
├── server/                # Express API
└── client/                # Vite + React app
```

## Local setup
```bash
# from repo root
npm install          # installs Husky
cd server && npm install && cp .env.example .env
npx prisma migrate dev --name init
npm run dev           # http://localhost:4000

# new terminal
cd client && npm install && cp .env.example .env
npm run dev           # http://localhost:5173
```

## Flow
1. User signs in (`/login`) via Firebase Auth
2. Completes the 9-step quiz (`/quiz`) — answers saved per step, resumable on reload
3. Last step triggers a HubSpot contact push (fire-and-forget, non-blocking)
4. Redirects to `/payment` — Stripe Elements checkout, plan-based PaymentIntent
5. Stripe webhook confirms payment status server-side (source of truth, not the client redirect)

## Deploying
- **Backend → Render**: `render.yaml` included, set env vars in the Render dashboard
- **Frontend → Vercel**: `vercel.json` included, set `VITE_*` env vars in the Vercel dashboard
- Set `CLIENT_ORIGIN` (server) to the deployed Vercel URL, and `VITE_API_BASE_URL` (client) to the deployed Render URL