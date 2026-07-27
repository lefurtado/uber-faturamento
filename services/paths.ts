import { doc } from 'firebase/firestore';

import { db } from './firebase';
import { buildRegistroDiarioId } from '../utils/registroDiario';

export function userDoc(uid: string) {
  return doc(db, 'users', uid);
}

export function registroDiarioDoc(uid: string, data: string) {
  const docId = buildRegistroDiarioId(data);
  return doc(db, 'users', uid, 'registrosDiarios', docId);
}
