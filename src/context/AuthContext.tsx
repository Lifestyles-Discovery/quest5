import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession, authKeys } from '@hooks/api/useAuth';
import { clearSession } from '@/api/client';
import type { Session, User, UserRights } from '@app-types/auth.types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  rights: UserRights | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const { data: session, isLoading } = useSession();

  const logout = useCallback(() => {
    clearSession();
    queryClient.setQueryData(authKeys.session, null);
    queryClient.clear();
  }, [queryClient]);

  // Listen for session expired events from the API client
  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [logout]);

  const value: AuthContextType = {
    session: session ?? null,
    user: session?.user ?? null,
    rights: session?.rights ?? null,
    isAuthenticated: !!session?.sessionKey,
    isLoading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 * Must be used within an AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
