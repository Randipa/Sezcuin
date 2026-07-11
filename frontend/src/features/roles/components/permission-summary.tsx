'use client';

import { Tag, Typography } from 'antd';
import { getModuleAccessSummary } from '@/lib/permissions';

interface PermissionSummaryProps {
  permissions: readonly string[];
}

export function PermissionSummary({ permissions }: PermissionSummaryProps) {
  const summaries = getModuleAccessSummary(permissions);

  if (!summaries.length) {
    return <Typography.Text type="secondary">No access</Typography.Text>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {summaries.map((summary) => (
        <Tag
          key={summary.label}
          style={{
            borderColor: `${summary.color}40`,
            backgroundColor: `${summary.color}12`,
            color: summary.color,
          }}
        >
          {summary.label} ({summary.selected}/{summary.total})
        </Tag>
      ))}
    </div>
  );
}
