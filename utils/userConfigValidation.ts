import type { UserConfig } from '../types/user';

export type UserConfigFormValues = {
  valorLitroCombustivel: string;
  kmPorLitro: string;
  custoManutencaoDia: string;
  custoSeguroDia: string;
};

export type UserConfigFormErrors = Partial<Record<keyof UserConfigFormValues, string>>;

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

export function validateUserConfigForm(
  values: UserConfigFormValues,
): { errors: UserConfigFormErrors; config: UserConfig | null } {
  const errors: UserConfigFormErrors = {};

  const valorLitro = validatePositiveField(
    values.valorLitroCombustivel,
    'o preço do litro',
  );
  if (valorLitro.error) {
    errors.valorLitroCombustivel = valorLitro.error;
  }

  const kmPorLitro = validatePositiveField(values.kmPorLitro, 'o consumo médio');
  if (kmPorLitro.error) {
    errors.kmPorLitro = kmPorLitro.error;
  }

  const custoManutencao = validateNonNegativeField(
    values.custoManutencaoDia,
    'o custo de manutenção por dia',
  );
  if (custoManutencao.error) {
    errors.custoManutencaoDia = custoManutencao.error;
  }

  const custoSeguro = validateNonNegativeField(
    values.custoSeguroDia,
    'o custo de seguro por dia',
  );
  if (custoSeguro.error) {
    errors.custoSeguroDia = custoSeguro.error;
  }

  if (Object.keys(errors).length > 0) {
    return { errors, config: null };
  }

  return {
    errors,
    config: {
      valorLitroCombustivel: valorLitro.parsed!,
      kmPorLitro: kmPorLitro.parsed!,
      custoManutencaoDia: custoManutencao.parsed!,
      custoSeguroDia: custoSeguro.parsed!,
    },
  };
}

export function hasUserConfigFormErrors(errors: UserConfigFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function formatConfigValue(value: number): string {
  return String(value).replace('.', ',');
}

export function emptyUserConfigFormValues(): UserConfigFormValues {
  return {
    valorLitroCombustivel: '',
    kmPorLitro: '',
    custoManutencaoDia: '',
    custoSeguroDia: '',
  };
}

export function userConfigToFormValues(config: UserConfig): UserConfigFormValues {
  return {
    valorLitroCombustivel: formatConfigValue(config.valorLitroCombustivel),
    kmPorLitro: formatConfigValue(config.kmPorLitro),
    custoManutencaoDia: formatConfigValue(config.custoManutencaoDia),
    custoSeguroDia: formatConfigValue(config.custoSeguroDia),
  };
}
