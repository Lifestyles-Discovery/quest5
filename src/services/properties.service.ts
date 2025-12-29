import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  Property,
  PropertySummary,
  PropertiesFilter,
  PropertyStage,
  CreatePropertyByAddressRequest,
  CreatePropertyByMlsRequest,
} from '@app-types/property.types';

/**
 * Properties service for Liberator API
 */
export const propertiesService = {
  /**
   * Get list of properties with optional filtering
   */
  async getProperties(filter: PropertiesFilter): Promise<PropertySummary[]> {
    const response = await apiClient.get<PropertySummary[]>(
      ENDPOINTS.properties.list,
      {
        headers: {
          searchTerm: filter.searchTerm || '',
          stages: filter.stages.join(','),
          useDates: String(filter.useDates),
          startDate: filter.startDate.toISOString(),
          endDate: filter.endDate.toISOString(),
        },
      }
    );
    return response.data;
  },

  /**
   * Get single property with full details
   */
  async getProperty(propertyId: string): Promise<Property> {
    const response = await apiClient.get<Property>(
      ENDPOINTS.properties.get(propertyId)
    );
    return response.data;
  },

  /**
   * Create property by address
   */
  async createByAddress(
    request: CreatePropertyByAddressRequest
  ): Promise<Property> {
    const response = await apiClient.post<Property>(
      ENDPOINTS.properties.createByAddress(
        request.address,
        request.city,
        request.state,
        request.zip
      ),
      {},
      {
        headers: {
          latitude: request.latitude?.toString() || '',
          longitude: request.longitude?.toString() || '',
        },
      }
    );
    return response.data;
  },

  /**
   * Create property by MLS number
   */
  async createByMls(request: CreatePropertyByMlsRequest): Promise<Property> {
    const response = await apiClient.post<Property>(
      ENDPOINTS.properties.createByMls(request.mlsMarket, request.mlsNumber)
    );
    return response.data;
  },

  /**
   * Update property stage
   */
  async updateStage(
    propertyId: string,
    stage: PropertyStage
  ): Promise<Property> {
    const response = await apiClient.put<Property>(
      ENDPOINTS.properties.updateStage(propertyId, stage)
    );
    return response.data;
  },
};
