import { DEFAULT_AUTHENTICATED_ROUTE } from '@/lib/constants';

/** Full page load so iOS Safari sends the session cookie to Next.js middleware. */
export function navigateAfterLogin(route = DEFAULT_AUTHENTICATED_ROUTE) {
  if (typeof window === 'undefined') {
    return;
  }

  window.location.assign(route);
}
