import { useQuery } from '@tanstack/react-query';
import { adminService } from '@services/admin.service';

/**
 * Query keys for admin data
 */
export const adminKeys = {
  mlsMarkets: ['mlsMarkets'] as const,
  states: ['states'] as const,
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
