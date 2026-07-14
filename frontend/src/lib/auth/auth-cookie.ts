import { AUTH_COOKIE_NAME } from '@/lib/constants';

function buildSessionCookie(value: string, maxAge?: number): string {
  const parts = [`${AUTH_COOKIE_NAME}=${value}`, 'path=/', 'samesite=lax'];

  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    parts.push('secure');
  }

  if (maxAge !== undefined) {
    parts.push(`max-age=${maxAge}`);
  }

  return parts.join('; ');
}

export function markSessionCookie() {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = buildSessionCookie('1');
}

export function clearSessionCookie() {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = buildSessionCookie('', 0);
}
