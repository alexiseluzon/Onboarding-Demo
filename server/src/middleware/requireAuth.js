import admin from '../lib/firebaseAdmin.js';

/**
 * Verifies the Firebase ID token sent as "Authorization: Bearer <token>".
 * Attaches decoded token (uid, email, etc.) to req.user on success.
 */
export default async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  try {
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}