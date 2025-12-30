import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Session, SignInCredentials } from '@app-types/auth.types';

/**
 * Authentication service for Liberator API
 * Note: Subscription management is in subscription.service.ts (uses Authenticator API)
 */
export const authService = {
  /**
   * Sign in with email and password
   * Returns session with user info and rights
   */
  async signIn(credentials: SignInCredentials): Promise<Session> {
    const response = await apiClient.post<Session>(
      ENDPOINTS.auth.signIn,
      {},
      {
        headers: {
          email: credentials.email,
          password: credentials.password,
        },
      }
    );
    return response.data;
  },

  /**
   * Validate and get session by session key
   */
  async getSession(sessionKey: string): Promise<Session> {
    const response = await apiClient.get<Session>(
      ENDPOINTS.auth.getSession(sessionKey)
    );
    return response.data;
  },

  /**
   * Create a shared session for evaluation sharing
   */
  async createSharedSession(guid: string, editKey: string): Promise<Session> {
    const response = await apiClient.post<Session>(
      ENDPOINTS.auth.createSharedSession(guid, editKey)
    );
    return response.data;
  },
};
