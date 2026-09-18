// src/sync/firebase.ts
// This is the ONLY file that initializes the Firebase SDK.
// The rest of the sync module (built in a later stage) will import
// `app`, `auth`, and `firestore` from here — never call
// initializeApp() anywhere else.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// These values come from your Firebase project settings.
// See README.md -> "Firebase project setup" for exact steps.
// They are safe to expose in client code (Firebase web config is
// not a secret — access is controlled by Firestore security rules,
// which we set up in a later stage).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
