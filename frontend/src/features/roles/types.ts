export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface CreateRoleInput {
  name: string;
  permissions: string[];
}

export interface UpdateRoleInput {
  name?: string;
  permissions?: string[];
}
