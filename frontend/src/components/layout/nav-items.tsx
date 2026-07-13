import { DashboardOutlined, SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { PERMISSIONS, type Permission } from '@/lib/auth/permissions';

export interface NavItem {
  key: string;
  href: string;
  label: string;
  icon: ReactNode;
  permission?: Permission;
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'overview',
    href: '/',
    label: 'Overview',
    icon: <DashboardOutlined />,
  },
  {
    key: 'users',
    href: '/users',
    label: 'Users',
    icon: <TeamOutlined />,
    permission: PERMISSIONS.USER_READ,
  },
  {
    key: 'roles',
    href: '/roles',
    label: 'Roles',
    icon: <SafetyCertificateOutlined />,
    permission: PERMISSIONS.ROLE_READ,
  },
];
