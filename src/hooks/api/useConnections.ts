import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { connectionsService } from '@services/connections.service';
import type { Connection, ConnectionFormData } from '@app-types/connection.types';

/**
 * Query keys for connections-related queries
 */
export const connectionsKeys = {
  all: ['connections'] as const,
  list: (userId: string) => [...connectionsKeys.all, 'list', userId] as const,
};

/**
 * Hook to fetch all connections for a user
 */
export function useConnections(userId: string | undefined) {
  return useQuery({
    queryKey: connectionsKeys.list(userId ?? ''),
    queryFn: () => connectionsService.getConnections(userId!),
    enabled: !!userId,
  });
}

/**
 * Hook to create a new connection
 */
export function useCreateConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: ConnectionFormData;
    }) => connectionsService.createConnection(userId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: connectionsKeys.list(variables.userId),
      });
    },
  });
}

/**
 * Hook to update a connection
 */
export function useUpdateConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      connectionId,
      data,
    }: {
      userId: string;
      connectionId: string;
      data: Partial<ConnectionFormData>;
    }) => connectionsService.updateConnection(userId, connectionId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: connectionsKeys.list(variables.userId),
      });
    },
  });
}

/**
 * Hook to toggle connection visibility (soft delete)
 */
export function useToggleConnectionVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      connectionId,
      deleted,
    }: {
      userId: string;
      connectionId: string;
      deleted: boolean;
    }) =>
      connectionsService.toggleConnectionVisibility(
        userId,
        connectionId,
        deleted
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: connectionsKeys.list(variables.userId),
      });
    },
  });
}

/**
 * Hook to add a connection to a property
 */
export function useAddConnectionToProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      connectionId,
    }: {
      propertyId: string;
      connectionId: string;
    }) => connectionsService.addConnectionToProperty(propertyId, connectionId),
    onSuccess: () => {
      // Invalidate properties to refresh linked connections
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

/**
 * Hook to remove a connection from a property
 */
export function useRemoveConnectionFromProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      connectionId,
    }: {
      propertyId: string;
      connectionId: string;
    }) =>
      connectionsService.removeConnectionFromProperty(propertyId, connectionId),
    onSuccess: () => {
      // Invalidate properties to refresh linked connections
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

/**
 * Helper to filter visible connections
 */
export function filterVisibleConnections(
  connections: Connection[] | undefined
): Connection[] {
  return connections?.filter((c) => !c.deleted) ?? [];
}
