import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { connectionsService } from '@services/connections.service';
import type { Connection, ConnectionFormData } from '@app-types/connection.types';

/**
 * Query keys for connections-related queries
 */
export const connectionsKeys = {
  all: ['connections'] as const,
  // Use for invalidation - matches all list queries for a user regardless of includeHidden
  listPrefix: (userId: string) => [...connectionsKeys.all, 'list', userId] as const,
  // Use for specific queries
  list: (userId: string, includeHidden: boolean) => [...connectionsKeys.all, 'list', userId, includeHidden] as const,
};

/**
 * Hook to fetch all connections for a user
 * @param userId - The user ID
 * @param includeHidden - Include soft-deleted connections (default: true to match Quest4 behavior)
 */
export function useConnections(userId: string | undefined, includeHidden: boolean = true) {
  return useQuery({
    queryKey: connectionsKeys.list(userId ?? '', includeHidden),
    queryFn: () => connectionsService.getConnections(userId!, includeHidden),
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
        queryKey: connectionsKeys.listPrefix(variables.userId),
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
        queryKey: connectionsKeys.listPrefix(variables.userId),
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
        queryKey: connectionsKeys.listPrefix(variables.userId),
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
