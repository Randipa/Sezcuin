'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      message.success('Registration successful! Please login.');
      router.push('/login');
    } catch (error: any) {
      message.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md rounded-xl border-gray-100 shadow-lg">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-500">Get started with Sezcuin ERP</p>
        </div>

        <Form
          name="register_form"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          className="space-y-4"
        >
          {/* First Name Input */}
          <Form.Item
            name="firstName"
            label={<span className="font-medium text-gray-600">First Name</span>}
            rules={[{ required: true, message: 'Please enter your first name!' }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="John"
              className="h-11 rounded-lg"
            />
          </Form.Item>

          {/* Last Name Input */}
          <Form.Item
            name="lastName"
            label={<span className="font-medium text-gray-600">Last Name</span>}
            rules={[{ required: true, message: 'Please enter your last name!' }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Doe"
              className="h-11 rounded-lg"
            />
          </Form.Item>

          {/* Email Input */}
          <Form.Item
            name="email"
            label={<span className="font-medium text-gray-600">Email Address</span>}
            rules={[
              { type: 'email', message: 'The input is not valid E-mail!' },
              { required: true, message: 'Please enter your email!' },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="name@company.com"
              className="h-11 rounded-lg"
            />
          </Form.Item>

          {/* Password Input */}
          <Form.Item
            name="password"
            label={<span className="font-medium text-gray-600">Password</span>}
            rules={[
              { required: true, message: 'Please enter your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="••••••••"
              className="h-11 rounded-lg"
            />
          </Form.Item>

          {/* Confirm Password Input */}
          <Form.Item
            name="confirmPassword"
            label={<span className="font-medium text-gray-600">Confirm Password</span>}
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="••••••••"
              className="h-11 rounded-lg"
            />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item className="pt-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="h-11 w-full rounded-lg border-none bg-indigo-600 text-base font-semibold transition-colors hover:bg-indigo-700"
            >
              Register
            </Button>
          </Form.Item>
        </Form>

        {/* Login Link */}
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">Already have an account? </span>
          <Link
            href="/login"
            className="font-medium text-indigo-600 transition-colors hover:text-indigo-500"
          >
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}
