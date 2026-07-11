'use client';

import { SafetyCertificateOutlined } from '@ant-design/icons';
import { Card, Typography } from 'antd';
import type { ReactNode } from 'react';
import { THEME_COLORS } from '@/lib/theme';

interface AuthShellProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  maxWidthClassName?: string;
}

/**
 * Shared centered-card frame for every unauthenticated/standalone screen
 * (login, forbidden, invite) so they read as one product instead of three
 * unrelated layouts.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  maxWidthClassName = 'max-w-sm',
}: AuthShellProps) {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: THEME_COLORS.pageBackground }}
    >
      <div className={`w-full ${maxWidthClassName}`}>
        <div className="mb-6 flex flex-col items-center text-center">
          <div
            className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
            style={{ backgroundColor: `${THEME_COLORS.primary}1a`, color: THEME_COLORS.primary }}
          >
            <SafetyCertificateOutlined />
          </div>
          <Typography.Title level={3} className="mb-1!">
            Sezcuin
          </Typography.Title>
          {(title ?? subtitle) && (
            <Typography.Text type="secondary">{title ?? subtitle}</Typography.Text>
          )}
        </div>

        <Card className="shadow-md">{children}</Card>
      </div>
    </div>
  );
}
