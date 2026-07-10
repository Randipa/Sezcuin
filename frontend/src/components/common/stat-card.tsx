'use client';

import { Card, Skeleton, Statistic } from 'antd';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  loading?: boolean;
  accentColor?: string;
  suffix?: ReactNode;
}

export function StatCard({ title, value, icon, loading, accentColor, suffix }: StatCardProps) {
  return (
    <Card className="h-full" styles={{ body: { padding: 20 } }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {loading ? (
            <Skeleton active title={false} paragraph={{ rows: 2, width: ['60%', '40%'] }} />
          ) : (
            <Statistic title={title} value={value} suffix={suffix} />
          )}
        </div>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg"
          style={{
            backgroundColor: `${accentColor ?? '#4f46e5'}1a`,
            color: accentColor ?? '#4f46e5',
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
