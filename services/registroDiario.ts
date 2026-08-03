import {
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

import type { RegistroDiario, RegistroDiarioInput } from '../types/registroDiario';
import type { UserConfig } from '../types/user';
import { buildRegistroDiarioId, montarRegistroDiario } from '../utils/registroDiario';
import { registroDiarioDoc, registrosDiariosCollection } from './paths';

function isRegistroDiario(value: unknown): value is RegistroDiario {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const registro = value as Record<string, unknown>;

  return (
    typeof registro.data === 'string' &&
    typeof registro.kmRodado === 'number' &&
    typeof registro.faturamento === 'number' &&
    typeof registro.custoCombustivel === 'number' &&
    typeof registro.custoManutencao === 'number' &&
    typeof registro.custoSeguro === 'number' &&
    typeof registro.gastoTotal === 'number' &&
    typeof registro.lucroLiquido === 'number' &&
    typeof registro.mediaRsPorKm === 'number' &&
    registro.timestamp != null
  );
}

export async function getRegistroDiario(
  uid: string,
  data: string,
): Promise<RegistroDiario | null> {
  const snapshot = await getDoc(registroDiarioDoc(uid, data));

  if (!snapshot.exists()) {
    return null;
  }

  const registro = snapshot.data();
  return isRegistroDiario(registro) ? registro : null;
}

export async function saveRegistroDiario(
  uid: string,
  input: RegistroDiarioInput,
  config: UserConfig,
): Promise<void> {
  const payload = montarRegistroDiario({
    input,
    config,
    timestamp: serverTimestamp(),
  });

  await setDoc(registroDiarioDoc(uid, input.data), payload);
}

/**
 * Busca registros diários do usuário no intervalo [dataInicio, dataFim] (YYYY-MM-DD).
 * Ordenados por `data` ascendente. Documentos inválidos são descartados.
 */
export async function buscarRegistrosPorPeriodo(
  uid: string,
  dataInicio: string,
  dataFim: string,
): Promise<RegistroDiario[]> {
  const inicio = buildRegistroDiarioId(dataInicio);
  const fim = buildRegistroDiarioId(dataFim);

  if (inicio > fim) {
    throw new Error(
      `Intervalo inválido: dataInicio ("${inicio}") deve ser <= dataFim ("${fim}").`,
    );
  }

  const q = query(
    registrosDiariosCollection(uid),
    where('data', '>=', inicio),
    where('data', '<=', fim),
    orderBy('data'),
  );

  const snapshot = await getDocs(q);
  const registros: RegistroDiario[] = [];

  for (const docSnap of snapshot.docs) {
    const registro = docSnap.data();
    if (isRegistroDiario(registro)) {
      registros.push(registro);
    }
  }

  return registros;
}

const FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  'permission-denied': 'Sem permissão para salvar o fechamento.',
  unavailable: 'Serviço indisponível. Tente novamente.',
  'failed-precondition': 'Não foi possível salvar o fechamento.',
  'resource-exhausted': 'Limite de requisições atingido. Tente novamente.',
  unauthenticated: 'Sessão expirada. Faça login novamente.',
  'not-found': 'Registro não encontrado.',
};

export function mapRegistroDiarioError(error: unknown): string {
  const code = (error as { code?: string }).code;
  if (code && FIRESTORE_ERROR_MESSAGES[code]) {
    return FIRESTORE_ERROR_MESSAGES[code];
  }
  return 'Ocorreu um erro ao salvar. Tente novamente.';
}
