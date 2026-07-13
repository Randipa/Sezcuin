import { ENTITY_ACCENT_COLORS, THEME_COLORS } from '@/lib/theme';

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

export const PERMISSION_MODULE_COLORS: Record<string, string> = {
  Users: ENTITY_ACCENT_COLORS.users,
  Roles: ENTITY_ACCENT_COLORS.roles,
};

export interface GroupedPermissions {
  label: string;
  color: string;
  permissions: { value: string; label: string }[];
}

export function groupPermissionsByModule(permissions: readonly string[]): GroupedPermissions[] {
  const owned = new Set(permissions);

  return PERMISSION_GROUPS.map((group) => ({
    label: group.label,
    color: PERMISSION_MODULE_COLORS[group.label] ?? THEME_COLORS.neutral,
    permissions: group.permissions
      .filter((permission) => owned.has(permission.value))
      .map((permission) => ({
        value: permission.value,
        label: permission.label,
      })),
  })).filter((group) => group.permissions.length > 0);
}

export function getModuleAccessSummary(
  permissions: readonly string[],
): { label: string; color: string; selected: number; total: number }[] {
  const ownedGroups = groupPermissionsByModule(permissions);

  return PERMISSION_GROUPS.map((group) => ({
    label: group.label,
    color: PERMISSION_MODULE_COLORS[group.label] ?? THEME_COLORS.neutral,
    selected: ownedGroups.find((owned) => owned.label === group.label)?.permissions.length ?? 0,
    total: group.permissions.length,
  })).filter((summary) => summary.selected > 0);
}

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
