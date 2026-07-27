const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export type AuthFormErrors = {
  email?: string;
  password?: string;
};

export function validateAuthForm(email: string, password: string): AuthFormErrors {
  const errors: AuthFormErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.email = 'Informe o e-mail.';
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = 'E-mail inválido.';
  }

  if (!password) {
    errors.password = 'Informe a senha.';
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }

  return errors;
}

export function hasAuthFormErrors(errors: AuthFormErrors): boolean {
  return Boolean(errors.email || errors.password);
}
