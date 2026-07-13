'use client';

import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Alert, Button } from 'antd';

interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  return (
    <Alert
      type="error"
      showIcon
      icon={<ExclamationCircleOutlined />}
      title={title}
      description={description}
      action={
        onRetry && (
          <Button size="small" danger onClick={onRetry}>
            Retry
          </Button>
        )
      }
    />
  );
}
