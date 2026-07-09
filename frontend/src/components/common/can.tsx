'use client';

import type { ReactNode } from 'react';
import { useHasPermission } from '@/features/auth/auth-store';
import type { Permission } from '@/lib/permissions';

interface CanProps {
  permission: Permission | Permission[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function Can({ permission, fallback = null, children }: CanProps) {
  const allowed = useHasPermission(permission);
  return allowed ? children : fallback;
}
