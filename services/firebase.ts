import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  type Auth,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  type Firestore,
} from 'firebase/firestore';

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

function createAuth(firebaseApp: FirebaseApp): Auth {
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(firebaseApp);
  }
}

function createFirestore(firebaseApp: FirebaseApp): Firestore {
  try {
    return initializeFirestore(firebaseApp, {
      localCache: persistentLocalCache(),
    });
  } catch {
    return getFirestore(firebaseApp);
  }
}

const firebaseConfig = getFirebaseConfig();

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = createAuth(app);
export const db = createFirestore(app);
export { app };
