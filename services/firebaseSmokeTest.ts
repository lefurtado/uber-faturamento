import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { auth, db } from './firebase';

const SMOKE_EMAIL = 'smoke-test@uber-faturamento.local';
const SMOKE_PASSWORD = 'SmokeTest123!';

export type SmokeTestResult = {
  ok: boolean;
  message: string;
};

async function ensureSmokeUser() {
  try {
    return await createUserWithEmailAndPassword(auth, SMOKE_EMAIL, SMOKE_PASSWORD);
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === 'auth/email-already-in-use') {
      return signInWithEmailAndPassword(auth, SMOKE_EMAIL, SMOKE_PASSWORD);
    }
    throw error;
  }
}

export async function runFirebaseSmokeTest(): Promise<SmokeTestResult> {
  try {
    const credential = await ensureSmokeUser();
    const uid = credential.user.uid;
    const smokeRef = doc(db, 'users', uid, '_smoke', 'ping');
    const payload = {
      ping: true,
      at: serverTimestamp(),
    };

    await setDoc(smokeRef, payload);
    const snap = await getDoc(smokeRef);

    if (!snap.exists()) {
      return {
        ok: false,
        message: `Auth OK (uid=${uid}), mas getDoc não encontrou o documento.`,
      };
    }

    return {
      ok: true,
      message: `OK — uid=${uid}; Firestore write/read em users/${uid}/_smoke/ping`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, message: `Falha: ${message}` };
  }
}

export async function signOutSmokeUser(): Promise<SmokeTestResult> {
  try {
    await signOut(auth);
    return { ok: true, message: 'Logout OK' };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, message: `Logout falhou: ${message}` };
  }
}
