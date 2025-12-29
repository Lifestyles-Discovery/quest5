import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Connection, ConnectionFormData } from '@app-types/connection.types';

/**
 * Connections service for managing contacts
 */
export const connectionsService = {
  /**
   * Get all connections for a user
   */
  async getConnections(userId: string): Promise<Connection[]> {
    const response = await apiClient.get<Connection[]>(
      ENDPOINTS.connections.list(userId)
    );
    return response.data;
  },

  /**
   * Create a new connection
   */
  async createConnection(
    userId: string,
    data: ConnectionFormData
  ): Promise<Connection> {
    const response = await apiClient.post<Connection>(
      ENDPOINTS.connections.create(userId),
      data
    );
    return response.data;
  },

  /**
   * Update a connection
   */
  async updateConnection(
    userId: string,
    connectionId: string,
    data: Partial<ConnectionFormData>
  ): Promise<Connection> {
    const response = await apiClient.put<Connection>(
      ENDPOINTS.connections.update(userId, connectionId),
      data
    );
    return response.data;
  },

  /**
   * Toggle connection visibility (soft delete)
   */
  async toggleConnectionVisibility(
    userId: string,
    connectionId: string,
    deleted: boolean
  ): Promise<Connection> {
    const response = await apiClient.put<Connection>(
      ENDPOINTS.connections.update(userId, connectionId),
      { deleted }
    );
    return response.data;
  },

  /**
   * Add a connection to a property
   */
  async addConnectionToProperty(
    propertyId: string,
    connectionId: string
  ): Promise<void> {
    await apiClient.post(
      ENDPOINTS.connections.addToProperty(propertyId, connectionId)
    );
  },

  /**
   * Remove a connection from a property
   */
  async removeConnectionFromProperty(
    propertyId: string,
    connectionId: string
  ): Promise<void> {
    await apiClient.delete(
      ENDPOINTS.connections.removeFromProperty(propertyId, connectionId)
    );
  },
};
