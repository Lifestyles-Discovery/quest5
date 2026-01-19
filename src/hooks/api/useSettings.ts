import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@services/settings.service';
import { authKeys } from './useAuth';
import type {
  UserPreferences,
  ReactivateSubscriptionRequest,
} from '@app-types/auth.types';
import type { AccountFormData } from '@app-types/settings.types';

/**
 * Hook to update user account information
 */
export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: AccountFormData }) =>
      settingsService.updateAccount(userId, data),
    onSuccess: () => {
      // Invalidate session to refresh user data
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
  });
}

/**
 * Hook to update user preferences
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      preferences,
    }: {
      userId: string;
      preferences: Partial<UserPreferences>;
    }) => settingsService.updatePreferences(userId, preferences),
    onSuccess: () => {
      // Invalidate session to refresh user preferences
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
  });
}

/**
 * Hook to reset preferences to defaults
 */
export function useResetPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      settingsService.resetPreferences(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
  });
}

/**
 * Hook to get Chargify billing portal URL
 */
export function useGetChargifyUrl() {
  return useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      settingsService.getChargifyUrl(userId),
  });
}

/**
 * Hook to reactivate a cancelled subscription with new credit card info
 * Matches Quest4's reactivation flow
 */
export function useReactivateSubscription() {
  return useMutation({
    mutationFn: (request: ReactivateSubscriptionRequest) =>
      settingsService.reactivateSubscription(request),
  });
}
