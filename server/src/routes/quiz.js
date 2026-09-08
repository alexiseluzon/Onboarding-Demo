import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import requireAuth from '../middleware/requireAuth.js';
import { pushContactToHubSpot } from '../lib/hubspot.js';

const router = Router();

const LAST_STEP_KEY = 'plan_type'; // final step in the 9-step flow — triggers HubSpot push

// Ensures a User row exists for the authenticated Firebase user (idempotent)
async function ensureUser(firebaseUser) {
  return prisma.user.upsert({
    where: { firebaseUid: firebaseUser.uid },
    update: {},
    create: {
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email || `${firebaseUser.uid}@unknown.local`,
    },
  });
}

function isValidAnswerPayload(body) {
  return (
    typeof body?.stepKey === 'string' &&
    body.stepKey.trim().length > 0 &&
    body.stepKey.length <= 100 &&
    body.value !== undefined
  );
}

// POST /api/quiz/answers — upsert a single step's answer
router.post('/answers', requireAuth, async (req, res, next) => {
  try {
    if (!isValidAnswerPayload(req.body)) {
      return res.status(400).json({ error: 'stepKey and value are required' });
    }

    const user = await ensureUser(req.user);
    const { stepKey, value } = req.body;

    const answer = await prisma.quizAnswer.upsert({
      where: { userId_stepKey: { userId: user.id, stepKey } },
      update: { value },
      create: { userId: user.id, stepKey, value },
    });

    // Fire-and-forget: push to HubSpot once the flow's last step is answered.
    // Non-blocking and non-fatal — never let a CRM outage break onboarding.
    if (stepKey === LAST_STEP_KEY) {
      pushContactToHubSpot({ email: user.email, fullName: req.user.name || '' }).catch(() => {});
    }

    res.status(200).json({ answer });
  } catch (err) {
    next(err);
  }
});

// GET /api/quiz/answers — fetch all saved answers for the current user (resume flow)
router.get('/answers', requireAuth, async (req, res, next) => {
  try {
    const user = await ensureUser(req.user);
    const answers = await prisma.quizAnswer.findMany({ where: { userId: user.id } });
    res.json({ answers });
  } catch (err) {
    next(err);
  }
});

export default router;