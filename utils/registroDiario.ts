import type { UserConfig } from '../types/user';
import type {
  MontarRegistroDiarioParams,
  RegistroDiarioDerivados,
  RegistroDiarioInput,
  RegistroDiarioWrite,
} from '../types/registroDiario';

const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Retorna a data local de hoje no formato YYYY-MM-DD. */
export function getDataLocalHoje(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Valida e retorna o ID do documento de registro diário (YYYY-MM-DD).
 * O ID deve coincidir com o campo `data` do registro.
 */
export function buildRegistroDiarioId(data: string): string {
  if (!DATA_REGEX.test(data)) {
    throw new Error(`Data inválida: "${data}". Use o formato YYYY-MM-DD.`);
  }

  const [year, month, day] = data.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    throw new Error(`Data inválida: "${data}". Use o formato YYYY-MM-DD.`);
  }

  return data;
}

type CalcularCamposDerivadosParams = {
  faturamento: number;
  kmRodado: number;
  custoCombustivel: number;
  custoManutencao: number;
  custoSeguro: number;
};

/** Calcula gastoTotal, lucroLiquido e mediaRsPorKm. */
export function calcularCamposDerivados(
  params: CalcularCamposDerivadosParams,
): Pick<RegistroDiarioDerivados, 'gastoTotal' | 'lucroLiquido' | 'mediaRsPorKm'> {
  const { faturamento, kmRodado, custoCombustivel, custoManutencao, custoSeguro } = params;

  const gastoTotal = custoCombustivel + custoManutencao + custoSeguro;
  const lucroLiquido = faturamento - gastoTotal;
  const mediaRsPorKm = kmRodado > 0 ? faturamento / kmRodado : 0;

  return { gastoTotal, lucroLiquido, mediaRsPorKm };
}

/**
 * Monta o payload completo para escrita no Firestore.
 * Copia custos fixos do config (snapshot) e calcula campos derivados.
 */
export function montarRegistroDiario({
  input,
  config,
  timestamp,
}: MontarRegistroDiarioParams): RegistroDiarioWrite {
  const docId = buildRegistroDiarioId(input.data);

  if (docId !== input.data) {
    throw new Error(`Campo data ("${input.data}") deve coincidir com o ID do documento.`);
  }

  const custoManutencao = config.custoManutencaoDia;
  const custoSeguro = config.custoSeguroDia;

  const derivados = calcularCamposDerivados({
    faturamento: input.faturamento,
    kmRodado: input.kmRodado,
    custoCombustivel: input.custoCombustivel,
    custoManutencao,
    custoSeguro,
  });

  return {
    ...input,
    custoManutencao,
    custoSeguro,
    ...derivados,
    timestamp,
  };
}

export type { RegistroDiarioInput };
