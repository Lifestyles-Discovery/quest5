import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  AdminUser,
  CreateUserFormData,
  UpdateUserFormData,
  EvaluationUsage,
  UserRightsUpdate,
} from '@app-types/admin.types';
import type { Session } from '@app-types/auth.types';

/**
 * MLS Market definition
 */
export interface MlsMarket {
  acronym: string;
  description: string;
}

/**
 * Admin service for user management and configuration
 */
export const adminService = {
  /**
   * Get available MLS markets
   */
  async getMlsMarkets(): Promise<MlsMarket[]> {
    const response = await apiClient.get<MlsMarket[]>(ENDPOINTS.admin.getMlsMarkets);
    return response.data;
  },

  /**
   * Get available US states
   */
  async getStates(): Promise<string[]> {
    const response = await apiClient.get<string[]>(ENDPOINTS.admin.getStates);
    return response.data;
  },

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<AdminUser[]> {
    const response = await apiClient.get<AdminUser[]>(ENDPOINTS.admin.getAllUsers);
    return response.data;
  },

  /**
   * Create a new employee/agent user
   */
  async createUser(data: CreateUserFormData): Promise<AdminUser> {
    const response = await apiClient.post<AdminUser>(
      'subscriptions/employee',
      null,
      {
        headers: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          isAgent: String(data.isAgent),
        },
      }
    );
    return response.data;
  },

  /**
   * Update user details from admin
   */
  async updateUser(userId: string, data: UpdateUserFormData): Promise<AdminUser> {
    const response = await apiClient.put<AdminUser>(
      ENDPOINTS.users.update(userId),
      data
    );
    return response.data;
  },

  /**
   * Update user rights/permissions
   */
  async updateUserRights(
    userId: string,
    rights: UserRightsUpdate
  ): Promise<void> {
    // Convert rights object to comma-separated string for API
    const rightsArray: string[] = [];
    if (rights.admin) rightsArray.push('admin');
    if (rights.search) rightsArray.push('search');
    if (rights.searchFree) rightsArray.push('searchFree');

    await apiClient.put(ENDPOINTS.users.updateRights(userId), null, {
      headers: {
        rights: rightsArray.join(','),
      },
    });
  },

  /**
   * Get evaluation usage statistics
   */
  async getEvaluationUsage(
    startDate: string,
    endDate: string
  ): Promise<EvaluationUsage> {
    const response = await apiClient.get<EvaluationUsage>(
      `admin/evaluations/usage/${startDate}/${endDate}`
    );
    return response.data;
  },

  /**
   * Impersonate a user (admin only)
   * Returns a session for the target user
   */
  async impersonateUser(userId: string): Promise<Session> {
    const response = await apiClient.post<Session>(
      ENDPOINTS.admin.impersonate(userId)
    );
    return response.data;
  },
};
