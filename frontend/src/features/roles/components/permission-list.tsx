'use client';

import { CheckCircleOutlined } from '@ant-design/icons';
import { Empty, Typography } from 'antd';
import { groupPermissionsByModule } from '@/lib/permissions';

interface PermissionListProps {
  permissions: readonly string[];
}

export function PermissionList({ permissions }: PermissionListProps) {
  const groups = groupPermissionsByModule(permissions);

  if (!groups.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No permissions assigned to this role"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => (
        <div key={group.label} className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
          <div className="mb-2.5 flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: group.color }}
            />
            <Typography.Text strong className="text-sm">
              {group.label}
            </Typography.Text>
            <Typography.Text type="secondary" className="text-xs">
              {group.permissions.length} permission{group.permissions.length !== 1 ? 's' : ''}
            </Typography.Text>
          </div>
          <div className="flex flex-col gap-2">
            {group.permissions.map((permission) => (
              <div key={permission.value} className="flex items-start gap-2">
                <CheckCircleOutlined
                  className="mt-0.5 shrink-0 text-sm"
                  style={{ color: group.color }}
                />
                <div className="min-w-0">
                  <Typography.Text className="text-sm">{permission.label}</Typography.Text>
                  <Typography.Text type="secondary" className="ml-1.5 text-xs">
                    {permission.value}
                  </Typography.Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
