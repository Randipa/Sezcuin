'use client';

import { App, Checkbox, Divider, Form, Input, Typography } from 'antd';
import { useEffect } from 'react';
import { FormDrawer } from '@/components/common/form-drawer';
import { ApiError } from '@/lib/api/error';
import { PERMISSION_GROUPS } from '@/lib/permissions';
import { useCreateRoleMutation, useUpdateRoleMutation } from '../hooks';
import type { Role } from '../types';

interface RoleFormValues {
  name: string;
  permissions: string[];
}

interface RoleFormDrawerProps {
  open: boolean;
  mode: 'create' | 'edit';
  role?: Role;
  onClose: () => void;
  onSuccess: () => void;
}

export function RoleFormDrawer({ open, mode, role, onClose, onSuccess }: RoleFormDrawerProps) {
  const [form] = Form.useForm<RoleFormValues>();
  const { message } = App.useApp();
  const createMutation = useCreateRoleMutation();
  const updateMutation = useUpdateRoleMutation();

  const submitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) {
      return;
    }
    if (mode === 'edit' && role) {
      form.setFieldsValue({ name: role.name, permissions: role.permissions ?? [] });
    } else {
      form.resetFields();
      form.setFieldsValue({ permissions: [] });
    }
  }, [open, mode, role, form]);

  const handleFinish = (values: RoleFormValues) => {
    if (mode === 'create') {
      createMutation.mutate(values, {
        onSuccess: () => {
          message.success('Role created successfully');
          onSuccess();
        },
        onError: (error) => {
          message.error(error instanceof ApiError ? error.message : 'Failed to create role');
        },
      });
      return;
    }

    if (!role) {
      return;
    }

    updateMutation.mutate(
      { id: role.id, input: values },
      {
        onSuccess: () => {
          message.success('Role updated successfully');
          onSuccess();
        },
        onError: (error) => {
          message.error(error instanceof ApiError ? error.message : 'Failed to update role');
        },
      },
    );
  };

  return (
    <FormDrawer<RoleFormValues>
      open={open}
      title={mode === 'create' ? 'Create role' : 'Edit role'}
      onClose={onClose}
      form={form}
      onFinish={handleFinish}
      submitting={submitting}
      submitLabel={mode === 'create' ? 'Create' : 'Save changes'}
    >
      <Form.Item
        name="name"
        label="Role name"
        extra="Stored in upper case, e.g. MANAGER"
        rules={[{ required: true, message: 'Role name is required' }]}
      >
        <Input placeholder="MANAGER" />
      </Form.Item>

      <Form.Item
        name="permissions"
        label="Permissions"
        rules={[{ required: true, message: 'Select at least one permission' }]}
      >
        <Checkbox.Group className="w-full">
          {PERMISSION_GROUPS.map((group) => (
            <div key={group.label} className="mb-3 w-full">
              <Typography.Text strong>{group.label}</Typography.Text>
              <Divider className="my-2!" />
              <div className="flex flex-col gap-2">
                {group.permissions.map((permission) => (
                  <Checkbox key={permission.value} value={permission.value}>
                    {permission.label}
                  </Checkbox>
                ))}
              </div>
            </div>
          ))}
        </Checkbox.Group>
      </Form.Item>
    </FormDrawer>
  );
}
