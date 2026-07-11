/**
 * Single source of truth for colors used outside of Ant Design's component
 * props (e.g. inline styles, Tailwind arbitrary values). Keeping them here
 * means a rebrand only requires editing this file plus the token overrides
 * in `app/providers.tsx`.
 */
export const THEME_COLORS = {
  primary: '#4f46e5',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  neutral: '#6b7280',
  darkSurface: '#111827',
  pageBackground: '#f5f5f5',
} as const;

/**
 * Accent color per entity/module, kept distinct so the same entity always
 * reads the same color regardless of which screen renders it (table,
 * detail drawer, dashboard stat card, etc.).
 */
export const ENTITY_ACCENT_COLORS = {
  users: THEME_COLORS.primary,
  roles: '#7c3aed',
} as const;
