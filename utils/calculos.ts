import type { AgregadoPeriodo, RegistroDiario } from '../types/registroDiario';

const AGREGADO_VAZIO: AgregadoPeriodo = {
  totalFaturamento: 0,
  totalLucro: 0,
  totalGasto: 0,
  totalCustoCombustivel: 0,
  totalCustoManutencao: 0,
  totalCustoSeguro: 0,
  totalKm: 0,
  mediaRsPorKm: 0,
};

export function calcularGastoTotal(
  custoCombustivel: number,
  custoManutencao: number,
  custoSeguro: number,
): number {
  return custoCombustivel + custoManutencao + custoSeguro;
}

export function calcularLucroLiquido(faturamento: number, gastoTotal: number): number {
  return faturamento - gastoTotal;
}

export function calcularMediaRsPorKm(faturamento: number, kmRodado: number): number {
  return kmRodado > 0 ? faturamento / kmRodado : 0;
}

/**
 * Agrega registros de um período.
 * mediaRsPorKm = totalFaturamento / totalKm (não média das médias diárias).
 */
export function agregarPeriodo(registros: RegistroDiario[]): AgregadoPeriodo {
  if (registros.length === 0) {
    return { ...AGREGADO_VAZIO };
  }

  const totais = registros.reduce(
    (acc, registro) => ({
      totalFaturamento: acc.totalFaturamento + registro.faturamento,
      totalLucro: acc.totalLucro + registro.lucroLiquido,
      totalGasto: acc.totalGasto + registro.gastoTotal,
      totalCustoCombustivel: acc.totalCustoCombustivel + registro.custoCombustivel,
      totalCustoManutencao: acc.totalCustoManutencao + registro.custoManutencao,
      totalCustoSeguro: acc.totalCustoSeguro + registro.custoSeguro,
      totalKm: acc.totalKm + registro.kmRodado,
    }),
    {
      totalFaturamento: 0,
      totalLucro: 0,
      totalGasto: 0,
      totalCustoCombustivel: 0,
      totalCustoManutencao: 0,
      totalCustoSeguro: 0,
      totalKm: 0,
    },
  );

  return {
    ...totais,
    mediaRsPorKm: calcularMediaRsPorKm(totais.totalFaturamento, totais.totalKm),
  };
}
