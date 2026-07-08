'use client';

import { Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { isSessionValid, useAuthStore } from '@/features/auth/auth-store';
import { clearSessionCookie } from '@/lib/auth-cookie';
import { LOGIN_ROUTE } from '@/lib/constants';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
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
      clearSession();
      clearSessionCookie();
      router.replace(LOGIN_ROUTE);
    }
  }, [hasHydrated, token, expiresAt, clearSession, router]);

  if (!sessionValid) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
