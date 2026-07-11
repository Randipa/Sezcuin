'use client';

import { App, Form, Input, Typography } from 'antd';
import { useEffect } from 'react';
import { FormDrawer } from '@/components/common/form-drawer';
import { ApiError } from '@/lib/api/error';
import { PermissionPicker } from './permission-picker';
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
  const selectedCount = Form.useWatch('permissions', form)?.length ?? 0;

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
    const payload = {
      ...values,
      name: values.name.trim().toUpperCase(),
    };

    if (mode === 'create') {
      createMutation.mutate(payload, {
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
      { id: role.id, input: payload },
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
      drawerSize={560}
    >
      <Form.Item
        name="name"
        label="Role name"
        extra="Stored in upper case, e.g. MANAGER"
        rules={[{ required: true, message: 'Role name is required' }]}
      >
        <Input
          placeholder="MANAGER"
          onBlur={(event) => {
            const upper = event.target.value.trim().toUpperCase();
            if (upper !== event.target.value) {
              form.setFieldValue('name', upper);
            }
          }}
        />
      </Form.Item>

      <Form.Item
        name="permissions"
        label={
          <div className="flex items-center justify-between gap-2">
            <span>Permissions</span>
            <Typography.Text type="secondary" className="text-xs font-normal">
              {selectedCount} selected
            </Typography.Text>
          </div>
        }
        rules={[{ required: true, message: 'Select at least one permission' }]}
      >
        <PermissionPicker />
      </Form.Item>
    </FormDrawer>
  );
}
