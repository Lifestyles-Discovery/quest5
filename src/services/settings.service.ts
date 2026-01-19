import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  User,
  UserPreferences,
  ReactivateSubscriptionRequest,
} from '@app-types/auth.types';
import type { AccountFormData } from '@app-types/settings.types';

/**
 * Settings service for user account and preferences
 */
export const settingsService = {
  /**
   * Update user account information
   */
  async updateAccount(userId: string, data: AccountFormData): Promise<User> {
    // Backend expects user data as HTTP headers, not body
    const headers: Record<string, string> = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    };
    if (data.password) {
      headers.password = data.password;
    }
    const response = await apiClient.put<User>(
      ENDPOINTS.users.update(userId),
      {}, // empty body
      { headers }
    );
    return response.data;
  },

  /**
   * Update user preferences (partial update supported)
   * Note: Backend expects preferences as HTTP headers, not body
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    // Build headers object - backend uses camelCase header names
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(preferences)) {
      if (value !== undefined && value !== null) {
        headers[key] = String(value);
      }
    }
    const response = await apiClient.put<UserPreferences>(
      ENDPOINTS.users.updatePreferences(userId),
      {}, // empty body
      { headers }
    );
    return response.data;
  },

  /**
   * Reset preferences to defaults
   */
  async resetPreferences(userId: string): Promise<UserPreferences> {
    const response = await apiClient.put<UserPreferences>(
      ENDPOINTS.users.resetPreferences(userId)
    );
    return response.data;
  },

  /**
   * Get Chargify billing portal URL
   */
  async getChargifyUrl(userId: string): Promise<string> {
    const response = await apiClient.get<string>(
      `users/${userId}/chargifyUrl`
    );
    return response.data;
  },

  /**
   * Reactivate a cancelled subscription with new credit card info
   * Matches Quest4's reactivation flow - uses Liberator API endpoint
   */
  async reactivateSubscription(
    request: ReactivateSubscriptionRequest
  ): Promise<void> {
    await apiClient.put(
      `users/${request.userId}/reactivate`,
      {},
      {
        headers: {
          userId: request.userId,
          firstNameOnCard: request.firstNameOnCard,
          lastNameOnCard: request.lastNameOnCard,
          ccNumber: request.cardNumber,
          expirationMonth: request.cardExpMonth,
          expirationYear: request.cardExpYear,
          cvv: request.cardCvv,
          subscriptionType: 'StandardMonthly',
          rights: '',
        },
      }
    );
  },
};
