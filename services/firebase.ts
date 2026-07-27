import Constants from 'expo-constants';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import type { FirebaseConfig } from '../types/firebase';

function getFirebaseConfig(): FirebaseConfig {
  const extra = Constants.expoConfig?.extra?.firebase as Partial<FirebaseConfig> | undefined;

  return {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? extra?.apiKey ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? extra?.authDomain ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? extra?.projectId ?? '',
    storageBucket:
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? extra?.storageBucket ?? '',
    messagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? extra?.messagingSenderId ?? '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? extra?.appId ?? '',
  };
}

const firebaseConfig = getFirebaseConfig();

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };
