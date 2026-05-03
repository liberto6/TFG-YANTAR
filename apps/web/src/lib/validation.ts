// Lightweight client-side validators for auth forms.
// Server still validates everything — these are just UX hints.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | null {
  if (!value) return "Introduce tu email.";
  if (!EMAIL_RE.test(value)) return "Email no válido.";
  return null;
}

export function validatePassword(value: string, minLength = 8): string | null {
  if (!value) return "Introduce una contraseña.";
  if (value.length < minLength) return `Mínimo ${minLength} caracteres.`;
  return null;
}

export function validateName(value: string): string | null {
  if (!value.trim()) return "Introduce tu nombre.";
  return null;
}
