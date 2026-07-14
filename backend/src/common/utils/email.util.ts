import type { TransformFnParams } from 'class-transformer';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function transformEmail({ value }: TransformFnParams): string {
  if (typeof value !== 'string') {
    return '';
  }

  return normalizeEmail(value);
}
