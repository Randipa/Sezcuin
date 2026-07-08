'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';

interface PermissionGuardProps {
  allowedPermissions: string[];
  children: React.ReactNode;
}

export default function PermissionGuard({ allowedPermissions, children }: PermissionGuardProps) {
  const { user } = useAuth();

  if (!user || !user.role) return null;

  const hasAccess = allowedPermissions.some((permission) =>
    user.role.permissions.includes(permission),
  );

  return hasAccess ? <>{children}</> : null;
}
