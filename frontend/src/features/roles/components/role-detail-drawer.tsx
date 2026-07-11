'use client';

import { EditOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { App, Button, Space, Tag, Typography } from 'antd';
import { Can } from '@/components/common/can';
import { ConfirmDeleteButton } from '@/components/common/confirm-delete-button';
import { DetailDrawer } from '@/components/common/detail-drawer';
import { ApiError } from '@/lib/api/error';
import { PERMISSIONS } from '@/lib/permissions';
import { ENTITY_ACCENT_COLORS } from '@/lib/theme';
import { PermissionList } from './permission-list';
import { useDeleteRoleMutation } from '../hooks';
import type { Role } from '../types';

interface RoleDetailDrawerProps {
  open: boolean;
  role: Role | null;
  onClose: () => void;
  onEdit: (role: Role) => void;
  onDeleted: () => void;
}

export function RoleDetailDrawer({
  open,
  role,
  onClose,
  onEdit,
  onDeleted,
}: RoleDetailDrawerProps) {
  const { message } = App.useApp();
  const deleteMutation = useDeleteRoleMutation();

  if (!role) {
    return null;
  }

  const handleDelete = () => {
    deleteMutation.mutate(role.id, {
      onSuccess: () => {
        message.success('Role deleted');
        onDeleted();
      },
      onError: (error) => {
        message.error(error instanceof ApiError ? error.message : 'Failed to delete role');
      },
    });
  };

  return (
    <DetailDrawer
      open={open}
      onClose={onClose}
      title="Role details"
      extra={
        <Space>
          <Can permission={PERMISSIONS.ROLE_DELETE}>
            <ConfirmDeleteButton
              title={`Delete the "${role.name}" role?`}
              description="Users assigned to it must be moved to another role first."
              onConfirm={handleDelete}
              loading={deleteMutation.isPending}
              buttonProps={{ size: 'small' }}
            />
          </Can>
          <Can permission={PERMISSIONS.ROLE_UPDATE}>
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(role)}>
              Edit
            </Button>
          </Can>
        </Space>
      }
    >
      <div
        className="mb-5 flex items-center gap-3 rounded-lg border p-4"
        style={{
          borderColor: `${ENTITY_ACCENT_COLORS.roles}26`,
          backgroundColor: `${ENTITY_ACCENT_COLORS.roles}0d`,
        }}
      >
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg"
          style={{
            backgroundColor: `${ENTITY_ACCENT_COLORS.roles}1a`,
            color: ENTITY_ACCENT_COLORS.roles,
          }}
        >
          <SafetyCertificateOutlined />
        </div>
        <div className="min-w-0">
          <Tag color="purple" className="m-0! mb-1! font-medium">
            {role.name}
          </Tag>
          <Typography.Text type="secondary" className="block text-sm">
            {role.permissions?.length ?? 0} permission
            {(role.permissions?.length ?? 0) !== 1 ? 's' : ''} assigned
          </Typography.Text>
        </div>
      </div>

      <Typography.Text strong className="mb-3 block text-sm">
        Permissions
      </Typography.Text>
      <PermissionList permissions={role.permissions ?? []} />
    </DetailDrawer>
  );
}
