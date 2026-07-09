'use client';

import { EditOutlined } from '@ant-design/icons';
import { App, Button, Descriptions, Space, Tag } from 'antd';
import { Can } from '@/components/common/can';
import { ConfirmDeleteButton } from '@/components/common/confirm-delete-button';
import { DetailDrawer } from '@/components/common/detail-drawer';
import { ApiError } from '@/lib/api/error';
import { PERMISSIONS } from '@/lib/permissions';
import { useDeleteUserMutation } from '../hooks';
import type { UserRecord } from '../types';

interface UserDetailDrawerProps {
  open: boolean;
  user: UserRecord | null;
  onClose: () => void;
  onEdit: (user: UserRecord) => void;
  onDeleted: () => void;
}

export function UserDetailDrawer({
  open,
  user,
  onClose,
  onEdit,
  onDeleted,
}: UserDetailDrawerProps) {
  const { message } = App.useApp();
  const deleteMutation = useDeleteUserMutation();

  if (!user) {
    return null;
  }

  const handleDelete = () => {
    deleteMutation.mutate(user.id, {
      onSuccess: () => {
        message.success('User deleted');
        onDeleted();
      },
      onError: (error) => {
        message.error(error instanceof ApiError ? error.message : 'Failed to delete user');
      },
    });
  };

  return (
    <DetailDrawer
      open={open}
      onClose={onClose}
      title="User details"
      extra={
        <Space>
          <Can permission={PERMISSIONS.USER_DELETE}>
            <ConfirmDeleteButton
              title="Delete this user?"
              description="This action cannot be undone."
              onConfirm={handleDelete}
              loading={deleteMutation.isPending}
              buttonProps={{ size: 'small' }}
            />
          </Can>
          <Can permission={PERMISSIONS.USER_UPDATE}>
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(user)}>
              Edit
            </Button>
          </Can>
        </Space>
      }
    >
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Full name">
          {user.firstName} {user.lastName}
        </Descriptions.Item>
        <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
        <Descriptions.Item label="Role">
          <Tag color="blue">{user.role.name}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={user.isActive ? 'green' : 'default'}>
            {user.isActive ? 'Active' : 'Inactive'}
          </Tag>
        </Descriptions.Item>
      </Descriptions>
    </DetailDrawer>
  );
}
