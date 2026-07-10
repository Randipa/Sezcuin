'use client';

import { LogoutOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Space, Tag, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuthStore, useCurrentUser } from '@/features/auth/auth-store';
import { LOGIN_ROUTE } from '@/lib/constants';

interface AppHeaderProps {
  onToggleMobileNav: () => void;
}

export function AppHeader({ onToggleMobileNav }: AppHeaderProps) {
  const router = useRouter();
  const user = useCurrentUser();
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = () => {
    clearSession();
    router.replace(LOGIN_ROUTE);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'role',
      label: (
        <span className="flex items-center gap-2 text-gray-500">
          Role <Tag color="blue">{user?.role}</Tag>
        </span>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Log out',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout.Header className="flex items-center justify-between bg-white! px-4 shadow-sm lg:px-6">
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={onToggleMobileNav}
        className="lg:hidden"
        aria-label="Open navigation"
      />
      <div className="hidden lg:block" />
      <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
        <Space className="cursor-pointer" size={8}>
          <Avatar icon={<UserOutlined />} />
          <Typography.Text className="hidden sm:inline">
            {user ? `${user.firstName} ${user.lastName}` : ''}
          </Typography.Text>
        </Space>
      </Dropdown>
    </Layout.Header>
  );
}
