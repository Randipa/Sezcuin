const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

export const API_BASE_URL =
  configuredApiUrl && configuredApiUrl.length > 0
    ? configuredApiUrl.replace(/\/$/, '')
    : 'http://localhost:3000/api';

export const AUTH_STORAGE_KEY = 'sezcuin-auth';

export const AUTH_COOKIE_NAME = 'sezcuin_session';

export const LOGIN_ROUTE = '/login';
export const DEFAULT_AUTHENTICATED_ROUTE = '/';
