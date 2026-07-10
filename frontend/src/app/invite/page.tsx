'use client';

import { App, Spin } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';
import { acceptInvite } from '@/features/auth/auth-api';
import { useAuthStore } from '@/features/auth/auth-store';
import { DEFAULT_AUTHENTICATED_ROUTE, LOGIN_ROUTE } from '@/lib/constants';
import { ApiError } from '@/lib/api/error';

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
        router.replace(DEFAULT_AUTHENTICATED_ROUTE);
      })
      .catch((error) => {
        message.error(error instanceof ApiError ? error.message : 'Unable to accept invitation');
        router.replace(LOGIN_ROUTE);
      });
  }, [hasHydrated, searchParams, setSession, router, message]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spin size="large" description="Signing you in…" />
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spin size="large" />
        </div>
      }
    >
      <InviteHandler />
    </Suspense>
  );
}
