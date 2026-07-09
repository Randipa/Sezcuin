export const PERMISSIONS = {
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  ROLE_READ: 'role:read',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export interface PermissionGroup {
  label: string;
  permissions: { value: Permission; label: string }[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: 'Users',
    permissions: [
      { value: PERMISSIONS.USER_READ, label: 'View users' },
      { value: PERMISSIONS.USER_CREATE, label: 'Create users' },
      { value: PERMISSIONS.USER_UPDATE, label: 'Edit users' },
      { value: PERMISSIONS.USER_DELETE, label: 'Delete users' },
    ],
  },
  {
    label: 'Roles',
    permissions: [
      { value: PERMISSIONS.ROLE_READ, label: 'View roles' },
      { value: PERMISSIONS.ROLE_CREATE, label: 'Create roles' },
      { value: PERMISSIONS.ROLE_UPDATE, label: 'Edit roles' },
      { value: PERMISSIONS.ROLE_DELETE, label: 'Delete roles' },
    ],
  },
];

function normalize(permission: string): string {
  return permission.toUpperCase();
}

export function hasPermission(
  userPermissions: readonly string[] | undefined,
  required: Permission | Permission[],
): boolean {
  if (!userPermissions?.length) {
    return false;
  }

  const owned = new Set(userPermissions.map(normalize));
  const requiredList = Array.isArray(required) ? required : [required];

  return requiredList.every((permission) => owned.has(normalize(permission)));
}
