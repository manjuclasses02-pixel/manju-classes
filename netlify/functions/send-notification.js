// ============================================================
// Netlify Function — sends push notifications via Firebase Cloud
// Messaging using the Admin SDK. Runs on Netlify's free tier
// (server-side, so the Service Account key stays secret here and
// never reaches the browser). No Firebase Blaze plan needed —
// this cost/quota is entirely Netlify's, and FCM sending itself
// is free.
//
// Required Netlify environment variable:
//   FIREBASE_SERVICE_ACCOUNT = <poora Service Account JSON, ek line string ki tarah>
//   (Firebase Console → Project Settings → Service Accounts → Generate new private key)
// ============================================================
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { title, message, branch, audience } = body;
  if (!title || !message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'title and message are both required' }) };
  }

  try {
    const db = admin.firestore();
    const roles = audience === 'Teachers' ? ['teacher']
      : audience === 'Parents' ? ['parent']
      : ['student', 'parent']; // "All Students" / "Branch 1" / "Branch 2" — reaches both students and their parents
    const snap = await db.collection('fcmTokens').where('role', 'in', roles).get();

    const tokens = [];
    snap.forEach((doc) => {
      const d = doc.data();
      if (!d.token) return;
      if (branch === 'all' || d.branch === 'all' || d.branch === branch) {
        tokens.push(d.token);
      }
    });

    if (!tokens.length) {
      return {
        statusCode: 200,
        body: JSON.stringify({ successCount: 0, failureCount: 0, note: 'No registered devices found for this audience (they may not have enabled notifications yet).' })
      };
    }

    const response = await admin.messaging().sendEachForMulticast({
      notification: { title, body: message },
      tokens
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ successCount: response.successCount, failureCount: response.failureCount })
    };
  } catch (err) {
    console.error('send-notification error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
