import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from 'firebase/auth';

import { auth } from './firebase';

export function signUp(email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signIn(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logOut(): Promise<void> {
  return signOut(auth);
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/wrong-password': 'Senha incorreta.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'Usuário não encontrado.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
  'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
  'auth/operation-not-allowed': 'Operação não permitida.',
};

export function mapAuthError(error: unknown): string {
  const code = (error as { code?: string }).code;
  if (code && AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code];
  }
  return 'Ocorreu um erro. Tente novamente.';
}
