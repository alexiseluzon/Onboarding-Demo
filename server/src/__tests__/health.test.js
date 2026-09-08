import request from 'supertest';
import express from 'express';
import quizRoutes from '../routes/quiz.js';

// Minimal app instance mirroring index.js, without starting a real listener,
// so Supertest can exercise the routes directly.
function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/quiz', quizRoutes);
  app.use((err, _req, res, _next) => {
    res.status(err.status || 500).json({ error: 'Internal server error' });
  });
  return app;
}

describe('GET /health', () => {
  it('returns 200 and status ok', async () => {
    const app = buildTestApp();
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Protected quiz routes', () => {
  it('rejects requests with no Authorization header', async () => {
    const app = buildTestApp();
    const res = await request(app).get('/api/quiz/answers');
    expect(res.status).toBe(401);
  });

  it('rejects malformed Authorization headers', async () => {
    const app = buildTestApp();
    const res = await request(app)
      .post('/api/quiz/answers')
      .set('Authorization', 'NotBearer sometoken')
      .send({ stepKey: 'full_name', value: 'Alexis' });
    expect(res.status).toBe(401);
  });
});