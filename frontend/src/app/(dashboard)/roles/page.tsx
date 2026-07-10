'use client';

import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Space, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useState } from 'react';
import { Can } from '@/components/common/can';
import { ConfirmDeleteButton } from '@/components/common/confirm-delete-button';
import { DataTable } from '@/components/common/data-table';
import { RoleDetailDrawer } from '@/features/roles/components/role-detail-drawer';
import { RoleFormDrawer } from '@/features/roles/components/role-form-drawer';
import { useDeleteRoleMutation, useRolesQuery } from '@/features/roles/hooks';
import type { Role } from '@/features/roles/types';
import { ApiError } from '@/lib/api/error';
import { PERMISSIONS } from '@/lib/permissions';

export default function RolesPage() {
  const { data: roles, isLoading } = useRolesQuery();
  const deleteMutation = useDeleteRoleMutation();
  const { message } = App.useApp();

  const [detailRole, setDetailRole] = useState<Role | null>(null);
  const [formState, setFormState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    role?: Role;
  }>({
    open: false,
    mode: 'create',
  });

  const openCreateForm = () => setFormState({ open: true, mode: 'create' });
  const openEditForm = (role: Role) => {
    setDetailRole(null);
    setFormState({ open: true, mode: 'edit', role });
  };

  const handleDelete = (role: Role) => {
    deleteMutation.mutate(role.id, {
      onSuccess: () => message.success('Role deleted'),
      onError: (error) =>
        message.error(error instanceof ApiError ? error.message : 'Failed to delete role'),
    });
  };

  const columns: TableProps<Role>['columns'] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Tag color="purple">{name}</Tag>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (_, record) => (
        <Space wrap>
          {record.permissions?.length ? (
            record.permissions
              .slice(0, 4)
              .map((permission) => <Tag key={permission}>{permission}</Tag>)
          ) : (
            <Typography.Text type="secondary">None</Typography.Text>
          )}
          {record.permissions?.length > 4 && <Tag>+{record.permissions.length - 4} more</Tag>}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space onClick={(event) => event.stopPropagation()}>
          <Can permission={PERMISSIONS.ROLE_UPDATE}>
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditForm(record)} />
          </Can>
          <Can permission={PERMISSIONS.ROLE_DELETE}>
            <ConfirmDeleteButton
              title="Delete this role?"
              description="This will fail if any user is still assigned to it."
              onConfirm={() => handleDelete(record)}
              loading={deleteMutation.isPending}
              buttonProps={{ size: 'small', danger: true, type: 'text' }}
            />
          </Can>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Typography.Title level={3} className="mb-0!">
            Roles
          </Typography.Title>
          <Can permission={PERMISSIONS.ROLE_CREATE}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>
              Create role
            </Button>
          </Can>
        </div>

        <DataTable<Role>
          data={roles}
          loading={isLoading}
          rowKey={(record) => record.id}
          columns={columns}
          searchPlaceholder="Search by role name"
          filterPredicate={(record, query) => record.name.toLowerCase().includes(query)}
          onRowClick={(record) => setDetailRole(record)}
        />

        <RoleDetailDrawer
          open={!!detailRole}
          role={detailRole}
          onClose={() => setDetailRole(null)}
          onEdit={openEditForm}
          onDeleted={() => setDetailRole(null)}
        />

        <RoleFormDrawer
          open={formState.open}
          mode={formState.mode}
          role={formState.role}
          onClose={() => setFormState((state) => ({ ...state, open: false }))}
          onSuccess={() => setFormState((state) => ({ ...state, open: false }))}
        />
    </div>
  );
}
