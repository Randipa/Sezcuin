'use client';

import { AdminOverview } from '@/features/dashboard/components/admin-overview';
import { PageHeader } from '@/components/ui/page-header';
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
      <PageHeader
        title={`${getGreeting()}${user ? `, ${user.firstName}` : ''}`}
        subtitle="Here's what's happening across your organization today."
      />

      <AdminOverview />
    </div>
  );
}
