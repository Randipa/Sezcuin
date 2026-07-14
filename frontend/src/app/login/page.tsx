'use client';

import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { Alert, App, Button, Form, Input } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthShell } from '@/components/layout/auth-shell';
import { login } from '@/features/auth/auth-api';
import { isSessionValid, useAuthStore } from '@/features/auth/auth-store';
import { ApiError } from '@/lib/api/error';
import { DEFAULT_AUTHENTICATED_ROUTE } from '@/lib/constants';
import { navigateAfterLogin } from '@/lib/auth/post-login-navigation';
import { consumeSessionEndedNotice } from '@/lib/auth/session-notice';
import type { LoginCredentials } from '@/features/auth/types';

export default function LoginPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const setSession = useAuthStore((state) => state.setSession);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const token = useAuthStore((state) => state.token);
  const expiresAt = useAuthStore((state) => state.expiresAt);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const notice = consumeSessionEndedNotice();
    if (!notice) {
      return;
    }

    requestAnimationFrame(() => {
      setSessionNotice(notice);
    });
  }, []);

  useEffect(() => {
    if (hasHydrated && isSessionValid({ token, expiresAt })) {
      router.replace(DEFAULT_AUTHENTICATED_ROUTE);
    }
  }, [hasHydrated, token, expiresAt, router]);

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setLoginError(null);
      setSession(response);
      navigateAfterLogin();
    },
    onError: (error) => {
      const apiError = error instanceof ApiError ? error : null;
      const errorMessage = apiError?.message ?? 'Unable to sign in. Please try again.';
      setLoginError(errorMessage);
      message.error(errorMessage);
    },
  });

  const handleFinish = (values: LoginCredentials) => {
    setLoginError(null);
    mutation.mutate(values);
  };

  return (
    <AuthShell subtitle="Sign in to manage your workspace">
      {loginError && (
        <Alert
          className="mb-4"
          type="error"
          showIcon
          title={loginError}
          closable
          onClose={() => setLoginError(null)}
        />
      )}

      {sessionNotice && (
        <Alert
          className="mb-4"
          type="warning"
          showIcon
          title={sessionNotice}
          closable
          onClose={() => setSessionNotice(null)}
        />
      )}

      <Form
        layout="vertical"
        onFinish={handleFinish}
        disabled={mutation.isPending}
        requiredMark={false}
        autoComplete="on"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Enter a valid email address' },
          ]}
        >
          <Input
            prefix={<MailOutlined className="text-gray-400" />}
            placeholder="you@company.com"
            autoComplete="username email"
            autoCapitalize="none"
            autoCorrect="off"
            inputMode="email"
            spellCheck={false}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="••••••••"
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </Form.Item>

        <Form.Item className="mb-0!">
          <Button type="primary" htmlType="submit" block loading={mutation.isPending}>
            Sign in
          </Button>
        </Form.Item>
      </Form>
    </AuthShell>
  );
}
