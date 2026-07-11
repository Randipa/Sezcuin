'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { App as AntdApp, ConfigProvider } from 'antd';
import type { ThemeConfig } from 'antd';
import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { createQueryClient } from '@/lib/query-client';
import { THEME_COLORS } from '@/lib/theme';

const theme: ThemeConfig = {
  token: {
    colorPrimary: THEME_COLORS.primary,
    colorSuccess: THEME_COLORS.success,
    colorWarning: THEME_COLORS.warning,
    colorError: THEME_COLORS.danger,
    borderRadius: 10,
    borderRadiusLG: 14,
    boxShadowTertiary: '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 2px 8px 0 rgba(15, 23, 42, 0.06)',
    fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, sans-serif',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: THEME_COLORS.darkSurface,
      bodyBg: THEME_COLORS.pageBackground,
    },
    Menu: {
      darkItemBg: THEME_COLORS.darkSurface,
      darkSubMenuItemBg: THEME_COLORS.darkSurface,
    },
    Statistic: {
      titleFontSize: 13,
      contentFontSize: 26,
    },
  },
};

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <AntdRegistry>
      <ConfigProvider theme={theme}>
        <AntdApp>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </AntdApp>
      </ConfigProvider>
    </AntdRegistry>
  );
}
