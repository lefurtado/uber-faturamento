import {
  getIntervaloMesAtual,
  getIntervaloMesEspecifico,
  getIntervaloSemanaAtual,
} from '../utils/intervaloDatas';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertIntervalo(
  actual: { dataInicio: string; dataFim: string },
  expectedInicio: string,
  expectedFim: string,
  label: string,
): void {
  assert(
    actual.dataInicio === expectedInicio,
    `${label}: dataInicio esperado ${expectedInicio}, recebido ${actual.dataInicio}`,
  );
  assert(
    actual.dataFim === expectedFim,
    `${label}: dataFim esperado ${expectedFim}, recebido ${actual.dataFim}`,
  );
}

// 1. Fevereiro não-bissexto (28 dias)
{
  const intervalo = getIntervaloMesEspecifico(2025, 2);
  assertIntervalo(intervalo, '2025-02-01', '2025-02-28', 'fevereiro 2025 (não-bissexto)');
}

// 2. Fevereiro bissexto (29 dias)
{
  const intervalo = getIntervaloMesEspecifico(2024, 2);
  assertIntervalo(intervalo, '2024-02-01', '2024-02-29', 'fevereiro 2024 (bissexto)');
}

// 3. Mês com 30 dias
{
  const intervalo = getIntervaloMesEspecifico(2026, 4);
  assertIntervalo(intervalo, '2026-04-01', '2026-04-30', 'abril 2026 (30 dias)');
}

// 4. Mês com 31 dias
{
  const intervalo = getIntervaloMesEspecifico(2026, 7);
  assertIntervalo(intervalo, '2026-07-01', '2026-07-31', 'julho 2026 (31 dias)');
}

// 5. Janeiro e dezembro (bordas do ano)
{
  assertIntervalo(
    getIntervaloMesEspecifico(2026, 1),
    '2026-01-01',
    '2026-01-31',
    'janeiro 2026',
  );
  assertIntervalo(
    getIntervaloMesEspecifico(2026, 12),
    '2026-12-01',
    '2026-12-31',
    'dezembro 2026',
  );
}

// 6. Semana a partir de uma quarta-feira → segunda–domingo
{
  // 2026-07-29 é quarta-feira
  const quarta = new Date(2026, 6, 29);
  assert(quarta.getDay() === 3, 'fixture: 2026-07-29 deve ser quarta');

  const intervalo = getIntervaloSemanaAtual(quarta);
  assertIntervalo(intervalo, '2026-07-27', '2026-08-02', 'semana a partir de quarta');
}

// 7. Semana a partir de segunda e de domingo
{
  const segunda = new Date(2026, 6, 27); // 2026-07-27 segunda
  assert(segunda.getDay() === 1, 'fixture: 2026-07-27 deve ser segunda');
  assertIntervalo(
    getIntervaloSemanaAtual(segunda),
    '2026-07-27',
    '2026-08-02',
    'semana a partir de segunda',
  );

  const domingo = new Date(2026, 7, 2); // 2026-08-02 domingo
  assert(domingo.getDay() === 0, 'fixture: 2026-08-02 deve ser domingo');
  assertIntervalo(
    getIntervaloSemanaAtual(domingo),
    '2026-07-27',
    '2026-08-02',
    'semana a partir de domingo',
  );
}

// 8. getIntervaloMesAtual delega ao mês da referência
{
  const ref = new Date(2026, 1, 15); // 15 de fevereiro 2026 (não-bissexto)
  assertIntervalo(
    getIntervaloMesAtual(ref),
    '2026-02-01',
    '2026-02-28',
    'mês atual a partir de referência',
  );
}

// 9. Mês inválido
{
  let threw = false;
  try {
    getIntervaloMesEspecifico(2026, 0);
  } catch {
    threw = true;
  }
  assert(threw, 'mes=0 deve lançar erro');

  threw = false;
  try {
    getIntervaloMesEspecifico(2026, 13);
  } catch {
    threw = true;
  }
  assert(threw, 'mes=13 deve lançar erro');
}

console.log('verify-intervaloDatas: todos os casos passaram.');
