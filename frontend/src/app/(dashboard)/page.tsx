'use client';

import { Typography } from 'antd';
import { AdminOverview } from '@/components/dashboard/admin-overview';
import { useCurrentUser } from '@/features/auth/auth-store';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function OverviewPage() {
  const user = useCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Typography.Title level={3} className="mb-1!">
          {getGreeting()}
          {user ? `, ${user.firstName}` : ''}
        </Typography.Title>
        <Typography.Text type="secondary">
          Here&apos;s what&apos;s happening across your organization today.
        </Typography.Text>
      </div>

      <AdminOverview />
    </div>
  );
}
