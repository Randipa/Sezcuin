import type { Role } from '@/features/roles/types';

export interface UserRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: Role;
}

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  roleName?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  roleName?: string;
  isActive?: boolean;
}
