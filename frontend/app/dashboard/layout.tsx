'use client';

import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

const { Header, Sider, Content } = Layout;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);

  const handleMenuClick = (path: string) => {
    router.push(path);
    if (window.innerWidth < 1024) {
      setCollapsed(true);
    }
  };

  const menuItems = [
    {
      key: '/dashboard/users',
      icon: <UserOutlined />,
      label: 'User Management',
      onClick: () => handleMenuClick('/dashboard/users'),
    },
  ];

  return (
    <Layout className="relative h-screen overflow-hidden">
      {!collapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth="0"
        width={200}
        onBreakpoint={(broken) => {
          setCollapsed(broken);
        }}
        className={`z-50 h-full bg-gray-900 shadow-xl transition-all duration-300 ${collapsed ? 'pointer-events-none' : 'pointer-events-auto'} !fixed lg:!relative`}
      >
        <div className="flex h-16 items-center justify-center border-b border-gray-800 text-lg font-bold text-white">
          Sezcuin
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          className="bg-transparent pt-4"
        />
      </Sider>

    
      <Layout className="flex h-full min-w-0 flex-col">
        {/* Header */}
        <Header
          style={{ background: '#ffffff', padding: '0 16px' }}
          className="z-30 flex h-16 items-center justify-between border-b border-gray-100 shadow-sm"
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: '#111827' }}
            className="flex h-10 w-10 items-center justify-center rounded-lg border-none text-base transition-colors hover:!bg-gray-100"
          />

          <div className="flex items-center gap-4">
            <span className="xs:block hidden text-sm font-medium text-gray-600 sm:text-base">
              {user?.lastName}
            </span>
            <Button
              type="text"
              danger
              icon={<LogoutOutlined />}
              onClick={logout}
              className="flex items-center gap-1"
            >
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </Header>

        {/* Content Box */}
        <Content className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          <div className="min-h-full rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
