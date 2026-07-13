import { apiClient } from '@/lib/api/client';
import type { LoginCredentials, LoginResponse } from './types';

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
  return data;
}

export async function acceptInvite(token: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/accept-invite', { token });
  return data;
}

export async function changePassword(newPassword: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/auth/change-password', {
    newPassword,
  });
  return data;
}
