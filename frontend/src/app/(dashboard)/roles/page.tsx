'use client';

import { EditOutlined, PlusOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { App, Button, Col, Row, Space, Tag, Tooltip, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useMemo, useState } from 'react';
import { Can } from '@/components/common/can';
import { ConfirmDeleteButton } from '@/components/common/confirm-delete-button';
import { DataTable } from '@/components/common/data-table';
import { ErrorState } from '@/components/common/empty-state';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { PermissionSummary } from '@/features/roles/components/permission-summary';
import { RoleDetailDrawer } from '@/features/roles/components/role-detail-drawer';
import { RoleFormDrawer } from '@/features/roles/components/role-form-drawer';
import { useDeleteRoleMutation, useRolesQuery } from '@/features/roles/hooks';
import type { Role } from '@/features/roles/types';
import { ApiError } from '@/lib/api/error';
import { PERMISSIONS } from '@/lib/permissions';
import { ENTITY_ACCENT_COLORS, THEME_COLORS } from '@/lib/theme';

export default function RolesPage() {
  const { data: roles, isLoading, isError, error, refetch } = useRolesQuery();
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

  const totalPermissions = useMemo(
    () => roles?.reduce((sum, role) => sum + (role.permissions?.length ?? 0), 0) ?? 0,
    [roles],
  );

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
      title: 'Role',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <div className="flex items-center gap-2">
          <SafetyCertificateOutlined style={{ color: ENTITY_ACCENT_COLORS.roles }} />
          <Tag color="purple" className="m-0! font-medium">
            {name}
          </Tag>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Access',
      key: 'access',
      render: (_, record) => <PermissionSummary permissions={record.permissions ?? []} />,
    },
    {
      title: 'Permissions',
      key: 'permissionCount',
      width: 120,
      align: 'center',
      sorter: (a, b) => (a.permissions?.length ?? 0) - (b.permissions?.length ?? 0),
      render: (_, record) => (
        <Typography.Text type="secondary">{record.permissions?.length ?? 0}</Typography.Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space onClick={(event) => event.stopPropagation()}>
          <Can permission={PERMISSIONS.ROLE_UPDATE}>
            <Tooltip title="Edit role">
              <Button
                size="small"
                type="text"
                icon={<EditOutlined />}
                onClick={() => openEditForm(record)}
              />
            </Tooltip>
          </Can>
          <Can permission={PERMISSIONS.ROLE_DELETE}>
            <ConfirmDeleteButton
              title={`Delete the "${record.name}" role?`}
              description="Users assigned to it must be moved to another role first."
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Roles"
        subtitle="Manage access levels and assign permissions to each role."
        actions={
          <Can permission={PERMISSIONS.ROLE_CREATE}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>
              Create role
            </Button>
          </Can>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <StatCard
            title="Total roles"
            value={roles?.length ?? 0}
            loading={isLoading}
            icon={<SafetyCertificateOutlined />}
            accentColor={ENTITY_ACCENT_COLORS.roles}
          />
        </Col>
        <Col xs={24} sm={12}>
          <StatCard
            title="Permissions assigned"
            value={totalPermissions}
            loading={isLoading}
            icon={<SafetyCertificateOutlined />}
            accentColor={THEME_COLORS.primary}
          />
        </Col>
      </Row>

      {isError ? (
        <ErrorState
          title="Failed to load roles"
          description={
            error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
          }
          onRetry={() => refetch()}
        />
      ) : (
        <DataTable<Role>
          data={roles}
          loading={isLoading}
          rowKey={(record) => record.id}
          columns={columns}
          searchPlaceholder="Search by role name"
          filterPredicate={(record, query) => record.name.toLowerCase().includes(query)}
          onRowClick={(record) => setDetailRole(record)}
        />
      )}

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
