import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsService } from '@services/documents.service';
import { propertiesKeys } from './useProperties';

/**
 * Query keys for documents-related queries
 */
export const documentsKeys = {
  all: ['documents'] as const,
  byProperty: (propertyId: string) =>
    [...documentsKeys.all, 'property', propertyId] as const,
};

/**
 * Hook to upload a file to a property
 * Combines: get presigned URL, upload to S3, register document
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, file }: { propertyId: string; file: File }) =>
      documentsService.uploadFile(propertyId, file),
    onSuccess: (_data, variables) => {
      // Invalidate property to refresh documents list
      queryClient.invalidateQueries({
        queryKey: propertiesKeys.detail(variables.propertyId),
      });
    },
  });
}

/**
 * Hook to get a download URL for a document
 */
export function useGetDocumentUrl() {
  return useMutation({
    mutationFn: ({
      propertyId,
      documentId,
    }: {
      propertyId: string;
      documentId: string;
    }) => documentsService.getDocumentUrl(propertyId, documentId),
  });
}

/**
 * Hook to update a document name
 */
export function useUpdateDocumentName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      documentId,
      name,
    }: {
      propertyId: string;
      documentId: string;
      name: string;
    }) => documentsService.updateDocumentName(propertyId, documentId, name),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: propertiesKeys.detail(variables.propertyId),
      });
    },
  });
}

/**
 * Hook to delete a document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      documentId,
    }: {
      propertyId: string;
      documentId: string;
    }) => documentsService.deleteDocument(propertyId, documentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: propertiesKeys.detail(variables.propertyId),
      });
    },
  });
}
