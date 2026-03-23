import { getApps, initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

/**
 * Firebase config — replace these values with your own project's settings
 * from the Firebase Console → Project Settings → Your apps → SDK Config.
 *
 * NOTE: This app uses a custom auth mechanism (bcrypt + SecureStore) and does
 * NOT use Firebase Authentication. Firestore data is keyed by `accountNumber`.
 * In production you would add Firebase Auth and lock the security rules.
 * For this challenge, Firestore rules should be set to allow read/write:
 *
 *   rules_version = '2';
 *   service cloud.firestore {
 *     match /databases/{database}/documents {
 *       match /{document=**} {
 *         allow read, write: if true;
 *       }
 *     }
 *   }
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const db = getFirestore(app)
export const storage = getStorage(app)
