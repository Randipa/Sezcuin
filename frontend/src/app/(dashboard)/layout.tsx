'use client';

import { Spin } from 'antd';
import { useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { isSessionValid, useAuthStore } from '@/features/auth/auth-store';
import { LOGIN_ROUTE } from '@/lib/constants';
import { SESSION_EXPIRED_MESSAGE, setSessionEndedNotice } from '@/lib/session-notice';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const token = useAuthStore((state) => state.token);
  const expiresAt = useAuthStore((state) => state.expiresAt);
  const clearSession = useAuthStore((state) => state.clearSession);

  const sessionValid = hasHydrated && isSessionValid({ token, expiresAt });

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }
    if (!isSessionValid({ token, expiresAt })) {
      const hadActiveSession = Boolean(token);
      clearSession();
      if (hadActiveSession) {
        setSessionEndedNotice(SESSION_EXPIRED_MESSAGE);
      }
      window.location.replace(LOGIN_ROUTE);
    }
  }, [hasHydrated, token, expiresAt, clearSession]);

  if (!sessionValid) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
