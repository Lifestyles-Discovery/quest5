import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  Session,
  SignInCredentials,
  CreateSubscriptionRequest,
} from '@app-types/auth.types';

/**
 * Authentication service for Liberator API
 */
export const authService = {
  /**
   * Sign in with email and password
   * Returns session with user info and rights
   */
  async signIn(credentials: SignInCredentials): Promise<Session> {
    const response = await apiClient.post<Session>(ENDPOINTS.auth.signIn, {}, {
      headers: {
        email: credentials.email,
        password: credentials.password,
      },
    });
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

  /**
   * Create a new subscription (sign up)
   */
  async createSubscription(
    request: CreateSubscriptionRequest
  ): Promise<Session> {
    const response = await apiClient.post<Session>(
      ENDPOINTS.auth.createSubscription,
      {},
      {
        headers: {
          firstName: request.firstName,
          lastName: request.lastName,
          email: request.email,
          password: request.password,
          cardNumber: request.cardNumber,
          cardExpMonth: request.cardExpMonth,
          cardExpYear: request.cardExpYear,
          cardCvv: request.cardCvv,
        },
      }
    );
    return response.data;
  },

  /**
   * Reactivate an expired subscription
   */
  async reactivateSubscription(
    userId: string,
    cardNumber: string,
    cardExpMonth: string,
    cardExpYear: string,
    cardCvv: string
  ): Promise<Session> {
    const response = await apiClient.post<Session>(
      ENDPOINTS.auth.reactivateSubscription(userId),
      {},
      {
        headers: {
          cardNumber,
          cardExpMonth,
          cardExpYear,
          cardCvv,
        },
      }
    );
    return response.data;
  },

  /**
   * Request password reset email
   */
  async forgotPassword(userId: string, email: string): Promise<void> {
    await apiClient.post(
      ENDPOINTS.users.forgotPassword(userId),
      {},
      {
        headers: { email },
      }
    );
  },
};
