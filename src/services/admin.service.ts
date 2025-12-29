import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';

/**
 * MLS Market definition
 */
export interface MlsMarket {
  acronym: string;
  description: string;
}

/**
 * Admin service for configuration data
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
};
