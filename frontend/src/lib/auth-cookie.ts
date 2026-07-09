import { AUTH_COOKIE_NAME } from './constants';

export function markSessionCookie() {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; samesite=lax`;
}

export function clearSessionCookie() {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}
