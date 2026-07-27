import type { RegistroDiario } from '../types/registroDiario';
import {
  agregarPeriodo,
  calcularGastoTotal,
  calcularLucroLiquido,
  calcularMediaRsPorKm,
} from '../utils/calculos';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertClose(actual: number, expected: number, message: string): void {
  assert(Math.abs(actual - expected) < 0.01, `${message}: esperado ${expected}, recebido ${actual}`);
}

function mockRegistro(partial: Omit<RegistroDiario, 'timestamp'>): RegistroDiario {
  return { ...partial, timestamp: {} as RegistroDiario['timestamp'] };
}

// 1. Dia normal (exemplo do schema)
{
  const gastoTotal = calcularGastoTotal(85, 16.67, 10);
  const lucroLiquido = calcularLucroLiquido(420.5, gastoTotal);
  const mediaRsPorKm = calcularMediaRsPorKm(420.5, 180);

  assertClose(gastoTotal, 111.67, 'gastoTotal dia normal');
  assertClose(lucroLiquido, 308.83, 'lucroLiquido dia normal');
  assertClose(mediaRsPorKm, 2.34, 'mediaRsPorKm dia normal');
}

// 2. Dia com km = 0
{
  const mediaRsPorKm = calcularMediaRsPorKm(100, 0);

  assert(mediaRsPorKm === 0, 'mediaRsPorKm com km=0 deve ser 0');
  assert(Number.isFinite(mediaRsPorKm), 'mediaRsPorKm não deve ser Infinity');
  assert(!Number.isNaN(mediaRsPorKm), 'mediaRsPorKm não deve ser NaN');
}

// 3. Período com múltiplos dias
{
  const registros: RegistroDiario[] = [
    mockRegistro({
      data: '2026-07-25',
      kmRodado: 100,
      faturamento: 200,
      custoCombustivel: 50,
      custoManutencao: 10,
      custoSeguro: 5,
      gastoTotal: 65,
      lucroLiquido: 135,
      mediaRsPorKm: 2,
    }),
    mockRegistro({
      data: '2026-07-26',
      kmRodado: 200,
      faturamento: 600,
      custoCombustivel: 80,
      custoManutencao: 10,
      custoSeguro: 5,
      gastoTotal: 95,
      lucroLiquido: 505,
      mediaRsPorKm: 3,
    }),
  ];

  const agregado = agregarPeriodo(registros);

  assertClose(agregado.totalFaturamento, 800, 'totalFaturamento período');
  assertClose(agregado.totalLucro, 640, 'totalLucro período');
  assertClose(agregado.totalGasto, 160, 'totalGasto período');
  assertClose(agregado.totalCustoCombustivel, 130, 'totalCustoCombustivel período');
  assertClose(agregado.totalCustoManutencao, 20, 'totalCustoManutencao período');
  assertClose(agregado.totalCustoSeguro, 10, 'totalCustoSeguro período');
  assertClose(agregado.totalKm, 300, 'totalKm período');
  assertClose(agregado.mediaRsPorKm, 800 / 300, 'mediaRsPorKm período');

  const mediaDasMedias = (2 + 3) / 2;
  assert(
    Math.abs(agregado.mediaRsPorKm - mediaDasMedias) > 0.01,
    'mediaRsPorKm do período não deve ser média das médias diárias',
  );
}

// Lista vazia
{
  const agregado = agregarPeriodo([]);

  assert(agregado.totalFaturamento === 0, 'lista vazia: totalFaturamento');
  assert(agregado.totalKm === 0, 'lista vazia: totalKm');
  assert(agregado.mediaRsPorKm === 0, 'lista vazia: mediaRsPorKm');
}

console.log('verify-calculos: todos os casos passaram.');
