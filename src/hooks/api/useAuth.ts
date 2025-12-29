import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@services/auth.service';
import { storeSession, clearSession, getStoredSession } from '@/api/client';
import type {
  Session,
  SignInCredentials,
  CreateSubscriptionRequest,
} from '@app-types/auth.types';

/**
 * Query keys for auth-related queries
 */
export const authKeys = {
  session: ['session'] as const,
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
 * Hook to create a new subscription (sign up)
 */
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateSubscriptionRequest) =>
      authService.createSubscription(request),
    onSuccess: (session: Session) => {
      storeSession(session);
      queryClient.setQueryData(authKeys.session, session);
    },
  });
}

/**
 * Hook to reactivate an expired subscription
 */
export function useReactivateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      cardNumber,
      cardExpMonth,
      cardExpYear,
      cardCvv,
    }: {
      userId: string;
      cardNumber: string;
      cardExpMonth: string;
      cardExpYear: string;
      cardCvv: string;
    }) =>
      authService.reactivateSubscription(
        userId,
        cardNumber,
        cardExpMonth,
        cardExpYear,
        cardCvv
      ),
    onSuccess: (session: Session) => {
      storeSession(session);
      queryClient.setQueryData(authKeys.session, session);
    },
  });
}

/**
 * Hook to request password reset
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: ({ userId, email }: { userId: string; email: string }) =>
      authService.forgotPassword(userId, email),
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
