'use client';

import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useAuthStore } from '@/features/auth/auth-store';
import { hasPermission } from '@/lib/auth/permissions';
import { NAV_ITEMS } from './nav-items';

interface SidebarMenuProps {
  onNavigate?: () => void;
}

export function SidebarMenu({ onNavigate }: SidebarMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const permissions = useAuthStore((state) => state.permissions);

  const items: MenuProps['items'] = useMemo(
    () =>
      NAV_ITEMS.filter(
        (item) => !item.permission || hasPermission(permissions, item.permission),
      ).map((item) => ({
        key: item.href,
        icon: item.icon,
        label: item.label,
      })),
    [permissions],
  );

  const selectedKey = useMemo(() => {
    const match = NAV_ITEMS.filter(
      (item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)),
    ).sort((a, b) => b.href.length - a.href.length)[0];
    return match ? [match.href] : [];
  }, [pathname]);

  const handleClick: MenuProps['onClick'] = ({ key }) => {
    router.push(key);
    onNavigate?.();
  };

  return (
    <Menu
      theme="dark"
      mode="inline"
      items={items}
      selectedKeys={selectedKey}
      onClick={handleClick}
      className="border-none"
    />
  );
}
