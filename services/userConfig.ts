import { getDoc, setDoc } from 'firebase/firestore';

import type { UserConfig } from '../types/user';
import { userDoc } from './paths';

function isUserConfig(value: unknown): value is UserConfig {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const config = value as Record<string, unknown>;

  return (
    typeof config.valorLitroCombustivel === 'number' &&
    typeof config.kmPorLitro === 'number' &&
    typeof config.custoManutencaoDia === 'number' &&
    typeof config.custoSeguroDia === 'number'
  );
}

export async function getUserConfig(uid: string): Promise<UserConfig | null> {
  const snapshot = await getDoc(userDoc(uid));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  const config = data.config;

  return isUserConfig(config) ? config : null;
}

export async function saveUserConfig(uid: string, config: UserConfig): Promise<void> {
  await setDoc(userDoc(uid), { config }, { merge: true });
}

const FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  'permission-denied': 'Sem permissão para salvar a configuração.',
  unavailable: 'Serviço indisponível. Tente novamente.',
  'failed-precondition': 'Não foi possível salvar a configuração.',
  'resource-exhausted': 'Limite de requisições atingido. Tente novamente.',
  unauthenticated: 'Sessão expirada. Faça login novamente.',
  'not-found': 'Configuração não encontrada.',
};

export function mapUserConfigError(error: unknown): string {
  const code = (error as { code?: string }).code;
  if (code && FIRESTORE_ERROR_MESSAGES[code]) {
    return FIRESTORE_ERROR_MESSAGES[code];
  }
  return 'Ocorreu um erro ao salvar. Tente novamente.';
}
