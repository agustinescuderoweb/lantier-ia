import {
  initializeApp,
  cert,
  getApps,
} from 'firebase-admin/app';

import {
  getFirestore,
} from 'firebase-admin/firestore';

function getFirebaseCredential() {
  const projectId =
    process.env.FIREBASE_PROJECT_ID;

  const clientEmail =
    process.env.FIREBASE_CLIENT_EMAIL;

  const privateKey =
    process.env.FIREBASE_PRIVATE_KEY?.replace(
      /\\n/g,
      '\n'
    );

  if (
    !projectId ||
    !clientEmail ||
    !privateKey
  ) {
    throw new Error(
      'Faltan variables de entorno de Firebase'
    );
  }

  return cert({
    projectId,
    clientEmail,
    privateKey,
  });
}

if (getApps().length === 0) {
  initializeApp({
    credential: getFirebaseCredential(),
  });
}

const db = getFirestore();

export { db };