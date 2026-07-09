'use client';

import { Drawer, Grid, Layout, Typography } from 'antd';
import { useState, type ReactNode } from 'react';
import { AppHeader } from './app-header';
import { SidebarMenu } from './sidebar-menu';

const { useBreakpoint } = Grid;

const BRAND = (
  <div className="flex h-16 items-center justify-center border-b border-white/10 px-4">
    <Typography.Text className="text-base! font-semibold! text-white!">
      Sezcuin Admin
    </Typography.Text>
  </div>
);

export function AppShell({ children }: { children: ReactNode }) {
  const screens = useBreakpoint();
  const isDesktop = screens.lg;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <Layout className="min-h-screen">
      {isDesktop && (
        <Layout.Sider theme="dark" width={240} className="fixed! inset-y-0! left-0! overflow-auto">
          {BRAND}
          <SidebarMenu />
        </Layout.Sider>
      )}

      {!isDesktop && (
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setMobileNavOpen(false)}
          open={mobileNavOpen}
          size={240}
          styles={{ body: { padding: 0, backgroundColor: '#111827' } }}
        >
          {BRAND}
          <SidebarMenu onNavigate={() => setMobileNavOpen(false)} />
        </Drawer>
      )}

      <Layout className={isDesktop ? 'ml-[240px]' : undefined}>
        <AppHeader onToggleMobileNav={() => setMobileNavOpen(true)} />
        <Layout.Content className="min-h-[calc(100vh-64px)] p-4 lg:p-6">{children}</Layout.Content>
      </Layout>
    </Layout>
  );
}
