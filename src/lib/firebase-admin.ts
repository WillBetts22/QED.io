import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Lazy init: defer until first use so Next.js static-page collection
// (/_not-found, etc.) doesn't crash when env vars aren't present at build time.
let _db: Firestore | undefined;

function getDb(): Firestore {
  if (_db) return _db;
  const app =
    getApps().length > 0
      ? getApps()[0]
      : initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          }),
        });
  _db = getFirestore(app);
  return _db;
}

export const adminDb = new Proxy({} as Firestore, {
  get(_, prop: string | symbol) {
    return getDb()[prop as keyof Firestore];
  },
});
