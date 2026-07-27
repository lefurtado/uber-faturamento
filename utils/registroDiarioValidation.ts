import type { RegistroDiario, RegistroDiarioInput } from '../types/registroDiario';
import { formatConfigValue } from './userConfigValidation';

export type RegistroDiarioFormValues = {
  kmRodado: string;
  faturamento: string;
  custoCombustivel: string;
};

export type RegistroDiarioFormErrors = Partial<Record<keyof RegistroDiarioFormValues, string>>;

function parseDecimalInput(value: string): number | null {
  const trimmed = value.trim().replace(',', '.');
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

function validateNonNegativeField(
  value: string,
  label: string,
): { error?: string; parsed?: number } {
  const parsed = parseDecimalInput(value);

  if (parsed === null) {
    return { error: `Informe ${label}.` };
  }

  if (parsed < 0) {
    return { error: `${label} não pode ser negativo.` };
  }

  return { parsed };
}

function validatePositiveField(
  value: string,
  label: string,
): { error?: string; parsed?: number } {
  const result = validateNonNegativeField(value, label);

  if (result.error) {
    return result;
  }

  if ((result.parsed ?? 0) <= 0) {
    return { error: `${label} deve ser maior que zero.` };
  }

  return result;
}

export function validateRegistroDiarioForm(
  values: RegistroDiarioFormValues,
  data: string,
): { errors: RegistroDiarioFormErrors; input: RegistroDiarioInput | null } {
  const errors: RegistroDiarioFormErrors = {};

  const kmRodado = validatePositiveField(values.kmRodado, 'a quilometragem rodada');
  if (kmRodado.error) {
    errors.kmRodado = kmRodado.error;
  }

  const faturamento = validateNonNegativeField(values.faturamento, 'o faturamento');
  if (faturamento.error) {
    errors.faturamento = faturamento.error;
  }

  const custoCombustivel = validateNonNegativeField(
    values.custoCombustivel,
    'o custo de combustível',
  );
  if (custoCombustivel.error) {
    errors.custoCombustivel = custoCombustivel.error;
  }

  if (Object.keys(errors).length > 0) {
    return { errors, input: null };
  }

  return {
    errors,
    input: {
      data,
      kmRodado: kmRodado.parsed!,
      faturamento: faturamento.parsed!,
      custoCombustivel: custoCombustivel.parsed!,
    },
  };
}

export function hasRegistroDiarioFormErrors(errors: RegistroDiarioFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function emptyRegistroDiarioFormValues(): RegistroDiarioFormValues {
  return {
    kmRodado: '',
    faturamento: '',
    custoCombustivel: '',
  };
}

export function registroToFormValues(registro: RegistroDiario): RegistroDiarioFormValues {
  return {
    kmRodado: formatConfigValue(registro.kmRodado),
    faturamento: formatConfigValue(registro.faturamento),
    custoCombustivel: formatConfigValue(registro.custoCombustivel),
  };
}
