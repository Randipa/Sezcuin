'use client';

import { App, Form, Input, Select, Switch } from 'antd';
import { useEffect } from 'react';
import { FormDrawer } from '@/components/common/form-drawer';
import { useRolesQuery } from '@/features/roles/hooks';
import { ApiError } from '@/lib/api/error';
import { useCreateUserMutation, useUpdateUserMutation } from '../hooks';
import type { UserRecord } from '../types';

interface UserFormValues {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  roleName: string;
  isActive: boolean;
}

interface UserFormDrawerProps {
  open: boolean;
  mode: 'create' | 'edit';
  user?: UserRecord;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserFormDrawer({ open, mode, user, onClose, onSuccess }: UserFormDrawerProps) {
  const [form] = Form.useForm<UserFormValues>();
  const { message } = App.useApp();
  const { data: roles } = useRolesQuery();
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();

  const submitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) {
      return;
    }
    if (mode === 'edit' && user) {
      form.setFieldsValue({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleName: user.role.name,
        isActive: user.isActive,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: true });
    }
  }, [open, mode, user, form]);

  const handleFinish = (values: UserFormValues) => {
    if (mode === 'create') {
      createMutation.mutate(
        {
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          password: values.password!,
          roleName: values.roleName,
        },
        {
          onSuccess: () => {
            message.success('User created successfully');
            onSuccess();
          },
          onError: (error) => {
            message.error(error instanceof ApiError ? error.message : 'Failed to create user');
          },
        },
      );
      return;
    }

    if (!user) {
      return;
    }

    updateMutation.mutate(
      {
        id: user.id,
        input: {
          firstName: values.firstName,
          lastName: values.lastName,
          roleName: values.roleName,
          isActive: values.isActive,
        },
      },
      {
        onSuccess: () => {
          message.success('User updated successfully');
          onSuccess();
        },
        onError: (error) => {
          message.error(error instanceof ApiError ? error.message : 'Failed to update user');
        },
      },
    );
  };

  return (
    <FormDrawer<UserFormValues>
      open={open}
      title={mode === 'create' ? 'Create user' : 'Edit user'}
      onClose={onClose}
      form={form}
      onFinish={handleFinish}
      submitting={submitting}
      submitLabel={mode === 'create' ? 'Create' : 'Save changes'}
    >
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Email is required' },
          { type: 'email', message: 'Enter a valid email address' },
        ]}
      >
        <Input placeholder="jane.doe@company.com" disabled={mode === 'edit'} />
      </Form.Item>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <Form.Item
          name="firstName"
          label="First name"
          rules={[{ required: true, message: 'Required' }]}
        >
          <Input placeholder="Jane" />
        </Form.Item>
        <Form.Item
          name="lastName"
          label="Last name"
          rules={[{ required: true, message: 'Required' }]}
        >
          <Input placeholder="Doe" />
        </Form.Item>
      </div>

      {mode === 'create' && (
        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Password is required' },
            { min: 8, message: 'Must be at least 8 characters' },
          ]}
        >
          <Input.Password placeholder="At least 8 characters" />
        </Form.Item>
      )}

      <Form.Item
        name="roleName"
        label="Role"
        rules={[{ required: true, message: 'Select a role' }]}
      >
        <Select
          placeholder="Select a role"
          options={roles?.map((role) => ({ label: role.name, value: role.name }))}
        />
      </Form.Item>

      {mode === 'edit' && (
        <Form.Item name="isActive" label="Active" valuePropName="checked">
          <Switch />
        </Form.Item>
      )}
    </FormDrawer>
  );
}
