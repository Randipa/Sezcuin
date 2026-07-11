'use client';

import { Checkbox, Typography } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { PERMISSION_GROUPS, PERMISSION_MODULE_COLORS } from '@/lib/permissions';
import { THEME_COLORS } from '@/lib/theme';

interface PermissionPickerProps {
  value?: string[];
  onChange?: (value: string[]) => void;
}

export function PermissionPicker({ value = [], onChange }: PermissionPickerProps) {
  const selected = new Set(value);

  const toggleGroup = (groupValues: string[], checked: boolean) => {
    const next = new Set(value);
    groupValues.forEach((permission) => {
      if (checked) {
        next.add(permission);
      } else {
        next.delete(permission);
      }
    });
    onChange?.([...next]);
  };

  const handleGroupToggle = (groupValues: string[]) => (event: CheckboxChangeEvent) => {
    toggleGroup(groupValues, event.target.checked);
  };

  const handlePermissionToggle = (permission: string, checked: boolean) => {
    const next = new Set(value);
    if (checked) {
      next.add(permission);
    } else {
      next.delete(permission);
    }
    onChange?.([...next]);
  };

  return (
    <div className="flex flex-col gap-3">
      {PERMISSION_GROUPS.map((group) => {
        const groupValues = group.permissions.map((permission) => permission.value);
        const selectedInGroup = groupValues.filter((permission) => selected.has(permission)).length;
        const allSelected = selectedInGroup === groupValues.length;
        const partiallySelected = selectedInGroup > 0 && !allSelected;
        const color = PERMISSION_MODULE_COLORS[group.label] ?? THEME_COLORS.neutral;

        return (
          <div key={group.label} className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <Typography.Text strong className="text-sm">
                  {group.label}
                </Typography.Text>
                <Typography.Text type="secondary" className="text-xs">
                  {selectedInGroup} of {groupValues.length} selected
                </Typography.Text>
              </div>
              <Checkbox
                checked={allSelected}
                indeterminate={partiallySelected}
                onChange={handleGroupToggle(groupValues)}
              >
                <span className="text-xs">Select all</span>
              </Checkbox>
            </div>
            <div className="flex flex-col gap-2 pl-1">
              {group.permissions.map((permission) => (
                <Checkbox
                  key={permission.value}
                  checked={selected.has(permission.value)}
                  onChange={(event) =>
                    handlePermissionToggle(permission.value, event.target.checked)
                  }
                >
                  <span className="text-sm">{permission.label}</span>
                  <Typography.Text type="secondary" className="ml-1.5 text-xs">
                    {permission.value}
                  </Typography.Text>
                </Checkbox>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
