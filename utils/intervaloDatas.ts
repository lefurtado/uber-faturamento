export type IntervaloDatas = {
  dataInicio: string;
  dataFim: string;
};

/** Formata Date local como YYYY-MM-DD. */
function formatDataLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Intervalo da semana corrente (segunda → domingo), no fuso local.
 * getDay(): 0=domingo … 6=sábado; deslocamento até segunda = (day + 6) % 7.
 */
export function getIntervaloSemanaAtual(referencia: Date = new Date()): IntervaloDatas {
  const day = referencia.getDay();
  const diasDesdeSegunda = (day + 6) % 7;

  const segunda = new Date(
    referencia.getFullYear(),
    referencia.getMonth(),
    referencia.getDate() - diasDesdeSegunda,
  );
  const domingo = new Date(
    segunda.getFullYear(),
    segunda.getMonth(),
    segunda.getDate() + 6,
  );

  return {
    dataInicio: formatDataLocal(segunda),
    dataFim: formatDataLocal(domingo),
  };
}

/**
 * Intervalo do mês corrente: dia 1º até o último dia (28/29/30/31).
 */
export function getIntervaloMesAtual(referencia: Date = new Date()): IntervaloDatas {
  return getIntervaloMesEspecifico(referencia.getFullYear(), referencia.getMonth() + 1);
}

/**
 * Intervalo de um mês específico.
 * @param ano — ano completo (ex.: 2026)
 * @param mes — mês 1–12
 */
export function getIntervaloMesEspecifico(ano: number, mes: number): IntervaloDatas {
  if (!Number.isInteger(ano) || !Number.isInteger(mes) || mes < 1 || mes > 12) {
    throw new Error(`Mês inválido: ano=${ano}, mes=${mes}. Use mes entre 1 e 12.`);
  }

  const inicio = new Date(ano, mes - 1, 1);
  // Dia 0 do mês seguinte = último dia do mês pedido
  const fim = new Date(ano, mes, 0);

  return {
    dataInicio: formatDataLocal(inicio),
    dataFim: formatDataLocal(fim),
  };
}
