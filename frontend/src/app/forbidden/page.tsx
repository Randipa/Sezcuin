'use client';

import { Button, Result } from 'antd';
import { useRouter } from 'next/navigation';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
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
    </div>
  );
}
