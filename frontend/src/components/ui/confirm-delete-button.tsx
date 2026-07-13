'use client';

import { DeleteOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';
import type { ButtonProps } from 'antd';

interface ConfirmDeleteButtonProps {
  title: string;
  description?: string;
  onConfirm: () => void;
  loading?: boolean;
  buttonProps?: ButtonProps;
}

export function ConfirmDeleteButton({
  title,
  description,
  onConfirm,
  loading,
  buttonProps,
}: ConfirmDeleteButtonProps) {
  return (
    <Popconfirm
      title={title}
      description={description}
      okText="Delete"
      okType="danger"
      cancelText="Cancel"
      onConfirm={onConfirm}
    >
      <Button danger icon={<DeleteOutlined />} loading={loading} {...buttonProps}>
        Delete
      </Button>
    </Popconfirm>
  );
}
