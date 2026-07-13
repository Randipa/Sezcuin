import axios from 'axios';
import { API_BASE_URL, LOGIN_ROUTE } from '@/lib/constants';
import { useAuthStore } from '@/features/auth/auth-store';
import { setSessionEndedNotice } from '@/lib/auth/session-notice';
import { toApiError } from './error';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error);

    if (apiError.statusCode === 401 && typeof window !== 'undefined') {
      const isAlreadyOnLoginPage = window.location.pathname === LOGIN_ROUTE;
      const hadActiveSession = Boolean(useAuthStore.getState().token);
      useAuthStore.getState().clearSession();

      if (!isAlreadyOnLoginPage) {
        if (hadActiveSession) {
          setSessionEndedNotice(apiError.message);
        }
        window.location.assign(LOGIN_ROUTE);
      }
    }

    return Promise.reject(apiError);
  },
);
