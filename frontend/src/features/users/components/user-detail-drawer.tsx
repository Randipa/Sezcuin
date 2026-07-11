'use client';

import { EditOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { App, Avatar, Button, Space, Tag, Typography } from 'antd';
import { Can } from '@/components/common/can';
import { ConfirmDeleteButton } from '@/components/common/confirm-delete-button';
import { DetailDrawer } from '@/components/common/detail-drawer';
import { ApiError } from '@/lib/api/error';
import { PERMISSIONS } from '@/lib/permissions';
import { ENTITY_ACCENT_COLORS } from '@/lib/theme';
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
              title={`Delete ${user.firstName} ${user.lastName}?`}
              description="They'll lose access right away, and this can't be undone."
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
      <div
        className="mb-5 flex items-center gap-3 rounded-lg border p-4"
        style={{
          borderColor: `${ENTITY_ACCENT_COLORS.users}26`,
          backgroundColor: `${ENTITY_ACCENT_COLORS.users}0d`,
        }}
      >
        <Avatar
          size={44}
          icon={<UserOutlined />}
          style={{
            backgroundColor: `${ENTITY_ACCENT_COLORS.users}1a`,
            color: ENTITY_ACCENT_COLORS.users,
          }}
        />
        <div className="min-w-0">
          <Typography.Text strong className="block">
            {user.firstName} {user.lastName}
          </Typography.Text>
          <Typography.Text type="secondary" className="flex items-center gap-1.5 text-sm">
            <MailOutlined /> {user.email}
          </Typography.Text>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
          <Typography.Text
            type="secondary"
            className="mb-1.5 block text-xs tracking-wide uppercase"
          >
            Role
          </Typography.Text>
          <Tag color="blue" className="m-0!">
            {user.role.name}
          </Tag>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
          <Typography.Text
            type="secondary"
            className="mb-1.5 block text-xs tracking-wide uppercase"
          >
            Status
          </Typography.Text>
          <Tag color={user.isActive ? 'green' : 'default'} className="m-0!">
            {user.isActive ? 'Active' : 'Inactive'}
          </Tag>
        </div>
      </div>
    </DetailDrawer>
  );
}
