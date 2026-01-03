import { authenticatorClient, API_KEY, QUEST_PRODUCT } from '@/api/authenticator';
import { apiClient } from '@/api/client';
import type {
  CreateSubscriptionRequest,
  SubscriptionStatus,
  ReactivateRequest,
  Session,
} from '@app-types/auth.types';

/**
 * Subscription service for Authenticator API
 * Handles signup, reactivation, and subscription status
 */
export const subscriptionService = {
  /**
   * Check if email is already a member
   */
  async isMember(email: string): Promise<boolean> {
    const response = await authenticatorClient.get<boolean>(
      '/subscriptions/isMember',
      { headers: { email } }
    );
    return response.data;
  },

  /**
   * Get subscription status for an email
   */
  async getProductStatus(email: string): Promise<SubscriptionStatus> {
    const response = await authenticatorClient.get<SubscriptionStatus>(
      '/subscriptions/status',
      {
        headers: {
          email,
          product: QUEST_PRODUCT.name,
        },
      }
    );
    return response.data;
  },

  /**
   * Create a new subscription with credit card
   */
  async createSubscription(request: CreateSubscriptionRequest): Promise<Session> {
    const response = await authenticatorClient.post<Session>(
      '/subscriptions',
      {},
      {
        headers: {
          apiKey: API_KEY,
          product: QUEST_PRODUCT.name,
          productHandle: QUEST_PRODUCT.handle,
          email: request.email,
          password: request.password,
          firstName: request.firstName,
          lastName: request.lastName,
          firstNameOnCard: request.firstNameOnCard,
          lastNameOnCard: request.lastNameOnCard,
          ccNumber: request.cardNumber,
          cvv: request.cardCvv,
          expirationMonth: request.cardExpMonth,
          expirationYear: request.cardExpYear,
        },
      }
    );
    return response.data;
  },

  /**
   * Reactivate a cancelled subscription
   * User must enter their password to confirm
   */
  async reactivateProduct(request: ReactivateRequest): Promise<void> {
    await authenticatorClient.put(
      '/subscriptions/reactivateProduct',
      {},
      {
        headers: {
          email: request.email,
          password: request.password,
          product: QUEST_PRODUCT.name,
        },
      }
    );
  },

  /**
   * Resume a subscription that's on hold
   */
  async resumeProduct(request: ReactivateRequest): Promise<void> {
    await authenticatorClient.put(
      '/subscriptions/resumeProduct',
      {},
      {
        headers: {
          email: request.email,
          password: request.password,
          product: QUEST_PRODUCT.name,
        },
      }
    );
  },

  /**
   * Request password reset email (via Liberator)
   * Sends the user's password to their email
   */
  async forgotPassword(email: string): Promise<void> {
    await apiClient.get('helpers/forgotpassword', {
      headers: { email },
    });
  },

  /**
   * Get billing portal URL for users with inactive subscriptions
   * Allows users to access billing portal without being fully authenticated
   * Uses Liberator API (not Authenticator) since it needs to return Chargify URL
   */
  async getBillingPortalUrl(email: string, password: string): Promise<string> {
    const response = await apiClient.post<{ url: string }>(
      'users/billingPortalUrl',
      {},
      {
        headers: {
          email,
          password,
        },
      }
    );
    return response.data.url;
  },
};
