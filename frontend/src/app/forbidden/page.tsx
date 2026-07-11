'use client';

import { Button, Result } from 'antd';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/common/auth-shell';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <AuthShell subtitle="Access restricted" maxWidthClassName="max-w-md">
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you don't have permission to access this page."
        extra={
          <Button type="primary" onClick={() => router.replace('/')}>
            Back to overview
          </Button>
        }
      />
    </AuthShell>
  );
}
