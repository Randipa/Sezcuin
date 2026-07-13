import { apiClient } from '@/lib/api/client';
import type { CreateRoleInput, Role, UpdateRoleInput } from './types';

export async function listRoles(): Promise<Role[]> {
  const { data } = await apiClient.get<Role[]>('/roles');
  return data;
}

export async function createRole(input: CreateRoleInput): Promise<Role> {
  const { data } = await apiClient.post<Role>('/roles', input);
  return data;
}

export async function updateRole(id: string, input: UpdateRoleInput): Promise<Role> {
  const { data } = await apiClient.patch<Role>(`/roles/${id}`, input);
  return data;
}

export async function deleteRole(id: string): Promise<void> {
  await apiClient.delete(`/roles/${id}`);
}
