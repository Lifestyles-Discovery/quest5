import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Connection, ConnectionFormData } from '@app-types/connection.types';

/**
 * Connections service for managing contacts
 * Note: Liberator API expects parameters via headers, not request body
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
   * API expects: type, name, phone, email via headers
   */
  async createConnection(
    userId: string,
    data: ConnectionFormData
  ): Promise<string> {
    const response = await apiClient.post<string>(
      ENDPOINTS.connections.create(userId),
      null, // No body
      {
        headers: {
          type: data.type,
          name: data.name,
          phone: data.phone || '',
          email: data.email || '',
        },
      }
    );
    return response.data; // Returns the connection ID
  },

  /**
   * Update a connection
   * API expects: type, name, email, phone, deleted via headers
   */
  async updateConnection(
    userId: string,
    connectionId: string,
    data: Partial<ConnectionFormData>
  ): Promise<Connection> {
    const response = await apiClient.put<Connection>(
      ENDPOINTS.connections.update(userId, connectionId),
      null, // No body
      {
        headers: {
          ...(data.type && { type: data.type }),
          ...(data.name && { name: data.name }),
          ...(data.email !== undefined && { email: data.email || '' }),
          ...(data.phone !== undefined && { phone: data.phone || '' }),
        },
      }
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
      null, // No body
      {
        headers: {
          deleted: String(deleted),
        },
      }
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
