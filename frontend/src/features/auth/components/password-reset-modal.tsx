'use client';

import { LockOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { App, Button, Form, Input, Modal, Typography } from 'antd';
import { changePassword } from '@/features/auth/auth-api';
import { useAuthStore } from '@/features/auth/auth-store';
import { ApiError } from '@/lib/api/error';

interface PasswordResetFormValues {
  newPassword: string;
  confirmPassword: string;
}

export function PasswordResetModal() {
  const [form] = Form.useForm<PasswordResetFormValues>();
  const { message } = App.useApp();
  const mustChangePassword = useAuthStore((state) => state.mustChangePassword);
  const clearMustChangePassword = useAuthStore((state) => state.clearMustChangePassword);

  const mutation = useMutation({
    mutationFn: (newPassword: string) => changePassword(newPassword),
    onSuccess: () => {
      clearMustChangePassword();
      form.resetFields();
      message.success('Password updated. You can now use your new password to sign in.');
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : 'Failed to update password');
    },
  });

  const handleFinish = (values: PasswordResetFormValues) => {
    mutation.mutate(values.newPassword);
  };

  return (
    <Modal
      open={mustChangePassword}
      title="Set your password"
      closable={false}
      mask={{ closable: false }}
      keyboard={false}
      footer={null}
      centered
    >
      <Typography.Paragraph type="secondary" className="mb-4!">
        Welcome! Before you continue, please choose a new password for your account.
      </Typography.Paragraph>

      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <Form.Item
          name="newPassword"
          label="New password"
          rules={[
            { required: true, message: 'Password is required' },
            { min: 8, message: 'Must be at least 8 characters' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="At least 8 characters"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm password"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Repeat your password"
          />
        </Form.Item>

        <Form.Item className="mb-0!">
          <Button type="primary" htmlType="submit" block loading={mutation.isPending}>
            Save password
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
