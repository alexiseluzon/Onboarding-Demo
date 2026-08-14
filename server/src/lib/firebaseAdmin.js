import admin from 'firebase-admin';

// Expects FIREBASE_SERVICE_ACCOUNT env var containing the JSON key as a string
// (never commit the raw key file — see .gitignore)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;