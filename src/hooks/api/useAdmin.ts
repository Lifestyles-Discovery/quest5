import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@services/admin.service';
import type {
  CreateUserFormData,
  UpdateUserFormData,
  UserRightsUpdate,
} from '@app-types/admin.types';

/**
 * Query keys for admin data
 */
export const adminKeys = {
  mlsMarkets: ['mlsMarkets'] as const,
  states: ['states'] as const,
  users: ['admin', 'users'] as const,
  evaluationUsage: (startDate: string, endDate: string) =>
    ['admin', 'evaluationUsage', startDate, endDate] as const,
};

/**
 * Hook to fetch available MLS markets
 */
export function useMlsMarkets() {
  return useQuery({
    queryKey: adminKeys.mlsMarkets,
    queryFn: () => adminService.getMlsMarkets(),
    staleTime: Infinity, // MLS markets rarely change
  });
}

/**
 * Hook to fetch available US states
 */
export function useStates() {
  return useQuery({
    queryKey: adminKeys.states,
    queryFn: () => adminService.getStates(),
    staleTime: Infinity, // States don't change
  });
}

/**
 * Hook to fetch all users (admin only)
 */
export function useAllUsers() {
  return useQuery({
    queryKey: adminKeys.users,
    queryFn: () => adminService.getAllUsers(),
  });
}

/**
 * Hook to create a new user/employee
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserFormData) => adminService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users });
    },
  });
}

/**
 * Hook to update user details from admin
 */
export function useUpdateUserFromAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserFormData }) =>
      adminService.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users });
    },
  });
}

/**
 * Hook to update user rights/permissions
 */
export function useUpdateUserRights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      rights,
    }: {
      userId: string;
      rights: UserRightsUpdate;
    }) => adminService.updateUserRights(userId, rights),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users });
    },
  });
}

/**
 * Hook to fetch evaluation usage statistics
 */
export function useEvaluationUsage(startDate: string, endDate: string) {
  return useQuery({
    queryKey: adminKeys.evaluationUsage(startDate, endDate),
    queryFn: () => adminService.getEvaluationUsage(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}
