'use client';

import { Drawer, Grid } from 'antd';
import type { ReactNode } from 'react';

const { useBreakpoint } = Grid;

interface DetailDrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  extra?: ReactNode;
  children: ReactNode;
}

export function DetailDrawer({ open, title, onClose, extra, children }: DetailDrawerProps) {
  const screens = useBreakpoint();
  const size = screens.sm ? 480 : '100%';

  return (
    <Drawer title={title} open={open} onClose={onClose} size={size} extra={extra}>
      {children}
    </Drawer>
  );
}
