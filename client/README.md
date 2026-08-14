# Onboarding Demo — Client

Vite + React + React Router frontend for the multi-step onboarding quiz.

## Stack
- Vite + React 18
- React Router (protected routes via Firebase auth state)
- Firebase Auth (email/password + Google SSO) — built in next step
- Stripe Elements — built in a later step

## Setup
```bash
npm install
cp .env.example .env   # fill in Firebase + Stripe publishable key
npm run dev
```

## Structure
```
src/
├── App.jsx              # router + skip link
├── App.css
├── main.jsx
├── context/AuthContext.jsx
├── components/ProtectedRoute.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── QuizPage.jsx
│   └── PaymentPage.jsx
└── lib/firebase.js
```