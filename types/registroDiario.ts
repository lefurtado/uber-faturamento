import type { FieldValue, Timestamp } from 'firebase/firestore';

import type { UserConfig } from './user';

/** Campos digitados pelo usuário no fechamento do dia. */
export type RegistroDiarioInput = {
  data: string;
  kmRodado: number;
  faturamento: number;
  custoCombustivel: number;
};

/** Campos calculados no client antes de persistir. */
export type RegistroDiarioDerivados = {
  custoManutencao: number;
  custoSeguro: number;
  gastoTotal: number;
  lucroLiquido: number;
  mediaRsPorKm: number;
};

/** Documento completo lido do Firestore. */
export type RegistroDiario = RegistroDiarioInput &
  RegistroDiarioDerivados & {
    timestamp: Timestamp;
  };

/** Payload enviado ao Firestore (timestamp como serverTimestamp). */
export type RegistroDiarioWrite = RegistroDiarioInput &
  RegistroDiarioDerivados & {
    timestamp: FieldValue;
  };

export type MontarRegistroDiarioParams = {
  input: RegistroDiarioInput;
  config: UserConfig;
  timestamp: FieldValue;
};
