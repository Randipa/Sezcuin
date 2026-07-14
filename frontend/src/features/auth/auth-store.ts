import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AUTH_STORAGE_KEY } from '@/lib/constants';
import { clearSessionCookie, markSessionCookie } from '@/lib/auth/auth-cookie';
import { decodeAccessToken } from '@/lib/auth/jwt';
import { safeBrowserStorage } from '@/lib/auth/safe-storage';
import { hasPermission, type Permission } from '@/lib/auth/permissions';
import type { AuthenticatedUser, LoginResponse } from './types';

interface AuthState {
  token: string | null;
  user: AuthenticatedUser | null;
  permissions: string[];
  mustChangePassword: boolean;
  expiresAt: number | null;
  hasHydrated: boolean;
  setSession: (response: LoginResponse) => void;
  clearMustChangePassword: () => void;
  clearSession: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      permissions: [],
      mustChangePassword: false,
      expiresAt: null,
      hasHydrated: false,
      setSession: (response) => {
        const decoded = decodeAccessToken(response.access_token);
        set({
          token: response.access_token,
          user: response.user,
          permissions: decoded?.permissions ?? [],
          mustChangePassword: response.mustChangePassword,
          expiresAt: decoded ? decoded.exp * 1000 : null,
        });
        markSessionCookie();
      },
      clearMustChangePassword: () => set({ mustChangePassword: false }),
      clearSession: () => {
        set({
          token: null,
          user: null,
          permissions: [],
          mustChangePassword: false,
          expiresAt: null,
        });
        clearSessionCookie();
      },
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => safeBrowserStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        permissions: state.permissions,
        mustChangePassword: state.mustChangePassword,
        expiresAt: state.expiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (isSessionValid({ token: state.token, expiresAt: state.expiresAt })) {
            markSessionCookie();
          } else {
            clearSessionCookie();
          }
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function isSessionValid(state: Pick<AuthState, 'token' | 'expiresAt'>): boolean {
  if (!state.token) {
    return false;
  }
  if (!state.expiresAt) {
    return true;
  }
  return Date.now() < state.expiresAt;
}

export function useHasPermission(required: Permission | Permission[]): boolean {
  return useAuthStore((state) => hasPermission(state.permissions, required));
}

export function useCurrentUser() {
  return useAuthStore((state) => state.user);
}

export function useMustChangePassword() {
  return useAuthStore((state) => state.mustChangePassword);
}
