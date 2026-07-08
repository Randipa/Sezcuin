'use client';

import { SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons';
import { Card, Col, Row, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { Can } from '@/components/common/can';
import { useCurrentUser } from '@/features/auth/auth-store';
import { PERMISSIONS } from '@/lib/permissions';

export default function OverviewPage() {
  const router = useRouter();
  const user = useCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Typography.Title level={3} className="mb-1!">
          Welcome back{user ? `, ${user.firstName}` : ''}
        </Typography.Title>
        <Typography.Text type="secondary">
          Manage your organization&apos;s users and roles from one place.
        </Typography.Text>
      </div>

      <Row gutter={[16, 16]}>
        <Can permission={PERMISSIONS.USER_READ}>
          <Col xs={24} sm={12} lg={8}>
            <Card
              hoverable
              onClick={() => router.push('/users')}
              className="h-full"
              styles={{ body: { display: 'flex', gap: 16, alignItems: 'center' } }}
            >
              <TeamOutlined className="text-3xl text-indigo-600" />
              <div>
                <Typography.Text strong>User Management</Typography.Text>
                <div>
                  <Typography.Text type="secondary">
                    View, create, and manage accounts
                  </Typography.Text>
                </div>
              </div>
            </Card>
          </Col>
        </Can>

        <Can permission={PERMISSIONS.ROLE_READ}>
          <Col xs={24} sm={12} lg={8}>
            <Card
              hoverable
              onClick={() => router.push('/roles')}
              className="h-full"
              styles={{ body: { display: 'flex', gap: 16, alignItems: 'center' } }}
            >
              <SafetyCertificateOutlined className="text-3xl text-indigo-600" />
              <div>
                <Typography.Text strong>Role Management</Typography.Text>
                <div>
                  <Typography.Text type="secondary">
                    Define roles and their permissions
                  </Typography.Text>
                </div>
              </div>
            </Card>
          </Col>
        </Can>
      </Row>
    </div>
  );
}
