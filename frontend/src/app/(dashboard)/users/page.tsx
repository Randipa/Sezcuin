'use client';

import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, App, Button, Space, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useState } from 'react';
import { Can } from '@/components/common/can';
import { ConfirmDeleteButton } from '@/components/common/confirm-delete-button';
import { DataTable } from '@/components/common/data-table';
import { useDeleteUserMutation, useUsersQuery } from '@/features/users/hooks';
import { UserDetailDrawer } from '@/features/users/components/user-detail-drawer';
import { UserFormDrawer } from '@/features/users/components/user-form-drawer';
import type { UserRecord } from '@/features/users/types';
import { ApiError } from '@/lib/api/error';
import { PERMISSIONS } from '@/lib/permissions';

export default function UsersPage() {
  const { data: users, isLoading, isError, error } = useUsersQuery();
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
      width: 120,
      render: (_, record) => (
        <Space onClick={(event) => event.stopPropagation()}>
          <Can permission={PERMISSIONS.USER_UPDATE}>
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditForm(record)} />
          </Can>
          <Can permission={PERMISSIONS.USER_DELETE}>
            <ConfirmDeleteButton
              title="Delete this user?"
              description="This action cannot be undone."
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
          Users
        </Typography.Title>
        <Can permission={PERMISSIONS.USER_CREATE}>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>
            Create user
          </Button>
        </Can>
      </div>

      {isError ? (
        <Alert
          type="error"
          showIcon
          message="Failed to load users"
          description={
            error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
          }
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
