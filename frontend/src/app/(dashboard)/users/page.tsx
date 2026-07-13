'use client';

import { CheckCircleOutlined, EditOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { App, Button, Col, Row, Space, Tag, Tooltip } from 'antd';
import type { TableProps } from 'antd';
import { useMemo, useState } from 'react';
import { Can } from '@/components/ui/can';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { DataTable } from '@/components/ui/data-table';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { useDeleteUserMutation, useUsersQuery } from '@/features/users/hooks';
import { UserDetailDrawer } from '@/features/users/components/user-detail-drawer';
import { UserFormDrawer } from '@/features/users/components/user-form-drawer';
import type { UserRecord } from '@/features/users/types';
import { ApiError } from '@/lib/api/error';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { ENTITY_ACCENT_COLORS, THEME_COLORS } from '@/lib/theme';

export default function UsersPage() {
  const { data: users, isLoading, isError, error, refetch } = useUsersQuery();
  const deleteMutation = useDeleteUserMutation();
  const { message } = App.useApp();

  const [detailUser, setDetailUser] = useState<UserRecord | null>(null);
  const [formState, setFormState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    user?: UserRecord;
  }>({
    open: false,
    mode: 'create',
  });

  const activeUsersCount = useMemo(
    () => users?.filter((user) => user.isActive).length ?? 0,
    [users],
  );

  const openCreateForm = () => setFormState({ open: true, mode: 'create' });
  const openEditForm = (user: UserRecord) => {
    setDetailUser(null);
    setFormState({ open: true, mode: 'edit', user });
  };

  const handleDelete = (user: UserRecord) => {
    deleteMutation.mutate(user.id, {
      onSuccess: () => message.success('User deleted'),
      onError: (error) =>
        message.error(error instanceof ApiError ? error.message : 'Failed to delete user'),
    });
  };

  const columns: TableProps<UserRecord>['columns'] = [
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => `${record.firstName} ${record.lastName}`,
      sorter: (a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role',
      key: 'role',
      filters: Array.from(new Set((users ?? []).map((user) => user.role.name))).map((name) => ({
        text: name,
        value: name,
      })),
      onFilter: (value, record) => record.role.name === value,
      render: (_, record) => <Tag color="blue">{record.role.name}</Tag>,
    },
    {
      title: 'Status',
      key: 'status',
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (_, record) => (
        <Tag color={record.isActive ? 'green' : 'default'}>
          {record.isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space onClick={(event) => event.stopPropagation()}>
          <Can permission={PERMISSIONS.USER_UPDATE}>
            <Tooltip title="Edit user">
              <Button
                size="small"
                type="text"
                icon={<EditOutlined />}
                onClick={() => openEditForm(record)}
              />
            </Tooltip>
          </Can>
          <Can permission={PERMISSIONS.USER_DELETE}>
            <ConfirmDeleteButton
              title={`Delete ${record.firstName} ${record.lastName}?`}
              description="They'll lose access right away, and this can't be undone."
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
        title="Users"
        subtitle="View, invite and manage the people in your workspace."
        actions={
          <Can permission={PERMISSIONS.USER_CREATE}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>
              Create user
            </Button>
          </Can>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <StatCard
            title="Total users"
            value={users?.length ?? 0}
            loading={isLoading}
            icon={<TeamOutlined />}
            accentColor={ENTITY_ACCENT_COLORS.users}
          />
        </Col>
        <Col xs={24} sm={12}>
          <StatCard
            title="Active users"
            value={activeUsersCount}
            loading={isLoading}
            icon={<CheckCircleOutlined />}
            accentColor={THEME_COLORS.success}
          />
        </Col>
      </Row>

      {isError ? (
        <ErrorState
          title="Failed to load users"
          description={
            error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
          }
          onRetry={() => refetch()}
        />
      ) : (
        <DataTable<UserRecord>
          data={users}
          loading={isLoading}
          rowKey={(record) => record.id}
          columns={columns}
          searchPlaceholder="Search by name or email"
          filterPredicate={(record, query) =>
            `${record.firstName} ${record.lastName} ${record.email}`.toLowerCase().includes(query)
          }
          onRowClick={(record) => setDetailUser(record)}
        />
      )}

      <UserDetailDrawer
        open={!!detailUser}
        user={detailUser}
        onClose={() => setDetailUser(null)}
        onEdit={openEditForm}
        onDeleted={() => setDetailUser(null)}
      />

      <UserFormDrawer
        open={formState.open}
        mode={formState.mode}
        user={formState.user}
        onClose={() => setFormState((state) => ({ ...state, open: false }))}
        onSuccess={() => setFormState((state) => ({ ...state, open: false }))}
      />
    </div>
  );
}
