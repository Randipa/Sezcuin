'use client';

import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { Can } from '@/components/common/can';
import { StatCard } from '@/components/common/stat-card';
import { useUsersQuery } from '@/features/users/hooks';
import { useRolesQuery } from '@/features/roles/hooks';
import { useHasPermission } from '@/features/auth/auth-store';
import { PERMISSIONS } from '@/lib/permissions';

interface ShortcutCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  onClick: () => void;
}

function ShortcutCard({ title, description, icon, accentColor, onClick }: ShortcutCardProps) {
  return (
    <Card hoverable onClick={onClick} className="h-full">
      <div className="flex items-start gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg"
          style={{ backgroundColor: `${accentColor}1a`, color: accentColor }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <Typography.Text strong>{title}</Typography.Text>
            <ArrowRightOutlined className="text-gray-400" />
          </div>
          <Typography.Text type="secondary" className="text-sm">
            {description}
          </Typography.Text>
        </div>
      </div>
    </Card>
  );
}

export function AdminOverview() {
  const router = useRouter();
  const canReadUsers = useHasPermission(PERMISSIONS.USER_READ);
  const canReadRoles = useHasPermission(PERMISSIONS.ROLE_READ);

  const { data: users, isLoading: usersLoading } = useUsersQuery({ enabled: canReadUsers });
  const { data: roles, isLoading: rolesLoading } = useRolesQuery({ enabled: canReadRoles });

  const activeUsersCount = users?.filter((user) => user.isActive).length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <Row gutter={[16, 16]}>
        <Can permission={PERMISSIONS.USER_READ}>
          <Col xs={24} sm={12} lg={8}>
            <StatCard
              title="Total users"
              value={users?.length ?? 0}
              loading={usersLoading}
              icon={<TeamOutlined />}
              accentColor="#4f46e5"
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <StatCard
              title="Active users"
              value={activeUsersCount}
              loading={usersLoading}
              icon={<CheckCircleOutlined />}
              accentColor="#16a34a"
            />
          </Col>
        </Can>
        <Can permission={PERMISSIONS.ROLE_READ}>
          <Col xs={24} sm={12} lg={8}>
            <StatCard
              title="Total roles"
              value={roles?.length ?? 0}
              loading={rolesLoading}
              icon={<SafetyCertificateOutlined />}
              accentColor="#d97706"
            />
          </Col>
        </Can>
      </Row>

      <div>
        <Typography.Title level={5} className="mb-3!">
          Quick actions
        </Typography.Title>
        <Row gutter={[16, 16]}>
          <Can permission={PERMISSIONS.USER_READ}>
            <Col xs={24} sm={12} lg={8}>
              <ShortcutCard
                title="User management"
                description="View, create and manage user accounts."
                icon={<TeamOutlined />}
                accentColor="#4f46e5"
                onClick={() => router.push('/users')}
              />
            </Col>
          </Can>
          <Can permission={PERMISSIONS.ROLE_READ}>
            <Col xs={24} sm={12} lg={8}>
              <ShortcutCard
                title="Role management"
                description="Define roles and fine-tune permissions."
                icon={<SafetyCertificateOutlined />}
                accentColor="#d97706"
                onClick={() => router.push('/roles')}
              />
            </Col>
          </Can>
        </Row>
      </div>
    </div>
  );
}
