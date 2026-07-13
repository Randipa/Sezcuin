export const THEME_COLORS = {
  primary: '#4f46e5',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  neutral: '#6b7280',
  darkSurface: '#111827',
  pageBackground: '#f5f5f5',
} as const;

export const ENTITY_ACCENT_COLORS = {
  users: THEME_COLORS.primary,
  roles: '#7c3aed',
} as const;
