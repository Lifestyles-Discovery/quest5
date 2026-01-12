import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesService } from '@services/properties.service';
import { trackActivity } from '@services/activity.service';
import type {
  Property,
  PropertySummary,
  PropertiesFilter,
  PropertyStage,
  CreatePropertyByAddressRequest,
  CreatePropertyByMlsRequest,
  PaginatedResponse,
} from '@app-types/property.types';

/**
 * Query keys for properties
 */
export const propertiesKeys = {
  all: ['properties'] as const,
  lists: () => [...propertiesKeys.all, 'list'] as const,
  list: (filter: PropertiesFilter) => [...propertiesKeys.lists(), filter] as const,
  details: () => [...propertiesKeys.all, 'detail'] as const,
  detail: (id: string) => [...propertiesKeys.details(), id] as const,
};

/**
 * Hook to fetch properties list with filtering and pagination
 */
export function useProperties(filter: PropertiesFilter) {
  return useQuery({
    queryKey: propertiesKeys.list(filter),
    queryFn: () => propertiesService.getProperties(filter),
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to fetch single property details
 */
export function useProperty(propertyId: string) {
  return useQuery({
    queryKey: propertiesKeys.detail(propertyId),
    queryFn: () => propertiesService.getProperty(propertyId),
    enabled: !!propertyId,
  });
}

/**
 * Hook to create property by address
 */
export function useCreatePropertyByAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreatePropertyByAddressRequest) =>
      propertiesService.createByAddress(request),
    onSuccess: (newProperty: Property, request) => {
      // Invalidate properties list to refetch
      queryClient.invalidateQueries({ queryKey: propertiesKeys.lists() });
      // Pre-populate the detail cache
      queryClient.setQueryData(
        propertiesKeys.detail(newProperty.id),
        newProperty
      );
      trackActivity('create_property', { address: request.address });
    },
  });
}

/**
 * Hook to create property by MLS number
 */
export function useCreatePropertyByMls() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreatePropertyByMlsRequest) =>
      propertiesService.createByMls(request),
    onSuccess: (newProperty: Property, request) => {
      // Invalidate properties list to refetch
      queryClient.invalidateQueries({ queryKey: propertiesKeys.lists() });
      // Pre-populate the detail cache
      queryClient.setQueryData(
        propertiesKeys.detail(newProperty.id),
        newProperty
      );
      trackActivity('create_property', { mlsNumber: request.mlsNumber });
    },
  });
}

/**
 * Hook to update property stage
 */
export function useUpdatePropertyStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      stage,
    }: {
      propertyId: string;
      stage: PropertyStage;
    }) => propertiesService.updateStage(propertyId, stage),
    onMutate: async ({ propertyId, stage }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: propertiesKeys.detail(propertyId),
      });
      await queryClient.cancelQueries({
        queryKey: propertiesKeys.lists(),
      });

      // Snapshot the previous values
      const previousProperty = queryClient.getQueryData<Property>(
        propertiesKeys.detail(propertyId)
      );
      const previousStage = previousProperty?.stage;

      // Optimistically update the property detail
      if (previousProperty) {
        queryClient.setQueryData<Property>(
          propertiesKeys.detail(propertyId),
          {
            ...previousProperty,
            stage,
          }
        );
      }

      // Also update in the list cache
      queryClient.setQueriesData<PaginatedResponse<PropertySummary>>(
        { queryKey: propertiesKeys.lists() },
        (old) =>
          old
            ? {
                ...old,
                items: old.items.map((p) =>
                  p.id === propertyId ? { ...p, stage } : p
                ),
              }
            : old
      );

      return { previousProperty, previousStage };
    },
    onError: (_err, { propertyId }, context) => {
      // Rollback detail cache on error
      if (context?.previousProperty) {
        queryClient.setQueryData(
          propertiesKeys.detail(propertyId),
          context.previousProperty
        );
      }
      // Rollback list cache on error
      if (context?.previousStage) {
        queryClient.setQueriesData<PaginatedResponse<PropertySummary>>(
          { queryKey: propertiesKeys.lists() },
          (old) =>
            old
              ? {
                  ...old,
                  items: old.items.map((p) =>
                    p.id === propertyId
                      ? { ...p, stage: context.previousStage! }
                      : p
                  ),
                }
              : old
        );
      }
    },
    onSettled: (_data, _error, { propertyId }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: propertiesKeys.detail(propertyId),
      });
      queryClient.invalidateQueries({ queryKey: propertiesKeys.lists() });
    },
  });
}
