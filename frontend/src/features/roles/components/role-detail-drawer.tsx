'use client';

import { EditOutlined } from '@ant-design/icons';
import { App, Button, Descriptions, Empty, Space, Tag } from 'antd';
import { Can } from '@/components/common/can';
import { ConfirmDeleteButton } from '@/components/common/confirm-delete-button';
import { DetailDrawer } from '@/components/common/detail-drawer';
import { ApiError } from '@/lib/api/error';
import { PERMISSIONS } from '@/lib/permissions';
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
              title="Delete this role?"
              description="This will fail if any user is still assigned to it."
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
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Name">
          <Tag color="purple">{role.name}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Permissions">
          {role.permissions?.length ? (
            <Space wrap>
              {role.permissions.map((permission) => (
                <Tag key={permission}>{permission}</Tag>
              ))}
            </Space>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No permissions assigned" />
          )}
        </Descriptions.Item>
      </Descriptions>
    </DetailDrawer>
  );
}
