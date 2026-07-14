'use client';

import { App, Spin, Typography } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';
import { AuthShell } from '@/components/layout/auth-shell';
import { acceptInvite } from '@/features/auth/auth-api';
import { useAuthStore } from '@/features/auth/auth-store';
import { LOGIN_ROUTE } from '@/lib/constants';
import { ApiError } from '@/lib/api/error';
import { navigateAfterLogin } from '@/lib/auth/post-login-navigation';

function InviteHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();
  const setSession = useAuthStore((state) => state.setSession);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const attempted = useRef(false);

  useEffect(() => {
    if (!hasHydrated || attempted.current) {
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      message.error('Invalid invitation link');
      router.replace(LOGIN_ROUTE);
      return;
    }

    attempted.current = true;

    acceptInvite(token)
      .then((response) => {
        setSession(response);
        navigateAfterLogin();
      })
      .catch((error) => {
        message.error(error instanceof ApiError ? error.message : 'Unable to accept invitation');
        router.replace(LOGIN_ROUTE);
      });
  }, [hasHydrated, searchParams, setSession, router, message]);

  return (
    <AuthShell subtitle="Setting up your account">
      <div className="flex flex-col items-center gap-3 py-6">
        <Spin size="large" />
        <Typography.Text type="secondary">Signing you in…</Typography.Text>
      </div>
    </AuthShell>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <AuthShell subtitle="Setting up your account">
          <div className="flex items-center justify-center py-6">
            <Spin size="large" />
          </div>
        </AuthShell>
      }
    >
      <InviteHandler />
    </Suspense>
  );
}
