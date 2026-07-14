import { AUTH_COOKIE_NAME } from '@/lib/constants';

function buildSessionCookie(value: string, maxAge?: number): string {
  const encodedValue = encodeURIComponent(value);
  const parts = [
    `${AUTH_COOKIE_NAME}=${encodedValue}`,
    'path=/',
    'SameSite=Lax',
  ];

  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    parts.push('Secure');
  }

  if (maxAge !== undefined) {
    parts.push(`Max-Age=${maxAge}`);
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
