'use client';

import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Alert, Button } from 'antd';

interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
}

/**
 * Standard "failed to load" banner for list pages. Centralizing this means
 * every page reports fetch failures the same way instead of some pages
 * silently rendering an empty table.
 */
export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  return (
    <Alert
      type="error"
      showIcon
      icon={<ExclamationCircleOutlined />}
      message={title}
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
