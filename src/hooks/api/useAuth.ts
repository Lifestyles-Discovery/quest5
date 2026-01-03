import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@services/auth.service';
import { subscriptionService } from '@services/subscription.service';
import { storeSession, clearSession, getStoredSession } from '@/api/client';
import type {
  Session,
  SignInCredentials,
  CreateSubscriptionRequest,
  ReactivateRequest,
} from '@app-types/auth.types';

/**
 * Query keys for auth-related queries
 */
export const authKeys = {
  session: ['session'] as const,
  subscriptionStatus: (email: string) => ['subscriptionStatus', email] as const,
};

/**
 * Hook to sign in with email/password
 * Stores session in sessionStorage on success
 */
export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: SignInCredentials) =>
      authService.signIn(credentials),
    onSuccess: (session: Session) => {
      storeSession(session);
      queryClient.setQueryData(authKeys.session, session);
    },
  });
}

/**
 * Hook to get/validate current session
 * Attempts to restore session from sessionStorage if available
 */
export function useSession() {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: async (): Promise<Session | null> => {
      const stored = getStoredSession();
      if (!stored?.sessionKey) {
        return null;
      }

      try {
        // Validate the session with the API
        const session = await authService.getSession(stored.sessionKey);
        storeSession(session);
        return session;
      } catch {
        // Session is invalid, clear it
        clearSession();
        return null;
      }
    },
    staleTime: Infinity, // Session doesn't become stale
    retry: false,
  });
}

/**
 * Hook to check if an email is already a member
 */
export function useIsMember() {
  return useMutation({
    mutationFn: (email: string) => subscriptionService.isMember(email),
  });
}

/**
 * Hook to get subscription status for an email
 */
export function useSubscriptionStatus(email: string) {
  return useQuery({
    queryKey: authKeys.subscriptionStatus(email),
    queryFn: () => subscriptionService.getProductStatus(email),
    enabled: !!email,
  });
}

/**
 * Hook to create a new subscription (sign up)
 * Uses Authenticator API
 */
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateSubscriptionRequest) =>
      subscriptionService.createSubscription(request),
    onSuccess: (session: Session) => {
      storeSession(session);
      queryClient.setQueryData(authKeys.session, session);
    },
  });
}

/**
 * Hook to reactivate a cancelled subscription
 * User re-enters credentials to confirm identity
 */
export function useReactivateSubscription() {
  return useMutation({
    mutationFn: (request: ReactivateRequest) =>
      subscriptionService.reactivateProduct(request),
  });
}

/**
 * Hook to resume a subscription that's on hold
 */
export function useResumeSubscription() {
  return useMutation({
    mutationFn: (request: ReactivateRequest) =>
      subscriptionService.resumeProduct(request),
  });
}

/**
 * Hook to request password reset email
 * Sends password to the user's email address
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => subscriptionService.forgotPassword(email),
  });
}

/**
 * Hook to get billing portal URL for inactive subscription users
 * Allows users to access billing portal without full authentication
 */
export function useGetBillingPortalUrl() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      subscriptionService.getBillingPortalUrl(email, password),
  });
}

/**
 * Hook to log out - clears session and cache
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    clearSession();
    queryClient.setQueryData(authKeys.session, null);
    queryClient.clear(); // Clear all cached data on logout
  };
}
