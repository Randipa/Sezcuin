import { apiClient } from '@/lib/api/client';
import type { CreateUserInput, UpdateUserInput, UserRecord } from './types';

export async function listUsers(): Promise<UserRecord[]> {
  const { data } = await apiClient.get<UserRecord[]>('/users');
  return data;
}

export async function createUser(input: CreateUserInput): Promise<UserRecord> {
  const { data } = await apiClient.post<UserRecord>('/users/register', input);
  return data;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<UserRecord> {
  const { data } = await apiClient.patch<UserRecord>(`/users/${id}`, input);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}
