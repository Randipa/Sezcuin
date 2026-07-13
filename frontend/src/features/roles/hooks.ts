import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRole, deleteRole, listRoles, updateRole } from './roles-api';
import type { CreateRoleInput, UpdateRoleInput } from './types';

export const rolesKeys = {
  all: ['roles'] as const,
};

export function useRolesQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: rolesKeys.all,
    queryFn: listRoles,
    enabled: options?.enabled,
  });
}

export function useCreateRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoleInput) => createRole(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rolesKeys.all }),
  });
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRoleInput }) => updateRole(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rolesKeys.all }),
  });
}

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rolesKeys.all }),
  });
}
