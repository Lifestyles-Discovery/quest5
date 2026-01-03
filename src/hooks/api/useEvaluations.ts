import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { evaluationsService } from '@services/evaluations.service';
import { apiClient } from '@/api/client';
import { propertiesKeys } from './useProperties';
import type {
  Evaluation,
  SaleCompInputs,
  RentCompInputs,
  DealTermInputs,
  ConventionalInputs,
  HardMoneyInputs,
} from '@app-types/evaluation.types';

/**
 * Query keys for evaluations
 */
export const evaluationsKeys = {
  all: ['evaluations'] as const,
  detail: (propertyId: string, evaluationId: string) =>
    [...evaluationsKeys.all, propertyId, evaluationId] as const,
  searchTypes: (propertyId: string, evaluationId: string) =>
    [...evaluationsKeys.all, 'searchTypes', propertyId, evaluationId] as const,
};

/**
 * Hook to fetch available search types for comps
 */
export function useSearchTypes(propertyId: string, evaluationId: string) {
  return useQuery({
    queryKey: evaluationsKeys.searchTypes(propertyId, evaluationId),
    queryFn: () => evaluationsService.getSearchTypes(propertyId, evaluationId),
    enabled: !!propertyId && !!evaluationId,
    staleTime: Infinity, // Search types don't change
  });
}

/**
 * Hook to create a new evaluation
 */
export function useCreateEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) =>
      evaluationsService.createEvaluation(propertyId),
    onSuccess: (newEvaluation) => {
      // Invalidate property to refresh evaluation list
      queryClient.invalidateQueries({
        queryKey: propertiesKeys.detail(newEvaluation.propertyId),
      });
      // Pre-populate evaluation cache
      queryClient.setQueryData(
        evaluationsKeys.detail(newEvaluation.propertyId, newEvaluation.id),
        newEvaluation
      );
    },
  });
}

/**
 * Hook to delete an evaluation
 */
export function useDeleteEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      evaluationId,
    }: {
      propertyId: string;
      evaluationId: string;
    }) => evaluationsService.deleteEvaluation(propertyId, evaluationId),
    onSuccess: (_data, { propertyId, evaluationId }) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: evaluationsKeys.detail(propertyId, evaluationId),
      });
      // Invalidate property to refresh evaluation list
      queryClient.invalidateQueries({
        queryKey: propertiesKeys.detail(propertyId),
      });
    },
  });
}

/**
 * Hook to copy an evaluation
 */
export function useCopyEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      evaluationId,
    }: {
      propertyId: string;
      evaluationId: string;
    }) => evaluationsService.copyEvaluation(propertyId, evaluationId),
    onSuccess: (newEvaluation) => {
      // Invalidate property to refresh evaluation list
      queryClient.invalidateQueries({
        queryKey: propertiesKeys.detail(newEvaluation.propertyId),
      });
      // Pre-populate new evaluation cache
      queryClient.setQueryData(
        evaluationsKeys.detail(newEvaluation.propertyId, newEvaluation.id),
        newEvaluation
      );
    },
  });
}

/**
 * Hook to update sale comp search
 */
export function useUpdateSaleComps() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      evaluationId,
      inputs,
      signal,
    }: {
      propertyId: string;
      evaluationId: string;
      inputs: Partial<SaleCompInputs>;
      signal?: AbortSignal;
    }) => evaluationsService.updateSaleComps(propertyId, evaluationId, inputs, signal),
    onSuccess: (updatedEvaluation, { propertyId, evaluationId }) => {
      // Preserve include flags from current cache to avoid overwriting toggled comps
      const current = queryClient.getQueryData<Evaluation>(
        evaluationsKeys.detail(propertyId, evaluationId)
      );

      if (current?.saleCompGroup?.saleComps && updatedEvaluation.saleCompGroup?.saleComps) {
        const includeMap = new Map(
          current.saleCompGroup.saleComps.map((c) => [c.id, c.include])
        );

        updatedEvaluation = {
          ...updatedEvaluation,
          saleCompGroup: {
            ...updatedEvaluation.saleCompGroup,
            saleComps: updatedEvaluation.saleCompGroup.saleComps.map((comp) => ({
              ...comp,
              // Preserve include flag if comp existed before, otherwise use server value
              include: includeMap.has(comp.id) ? includeMap.get(comp.id)! : comp.include,
            })),
          },
        };
      }

      queryClient.setQueryData(
        evaluationsKeys.detail(propertyId, evaluationId),
        updatedEvaluation
      );
    },
  });
}

/**
 * Hook to toggle sale comp inclusion
 */
export function useToggleSaleCompInclusion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      evaluationId,
      compId,
      include,
    }: {
      propertyId: string;
      evaluationId: string;
      compId: string;
      include: boolean;
    }) =>
      evaluationsService.toggleSaleCompInclusion(
        propertyId,
        evaluationId,
        compId,
        include
      ),
    onMutate: async ({ propertyId, evaluationId, compId, include }) => {
      // Optimistic update
      await queryClient.cancelQueries({
        queryKey: evaluationsKeys.detail(propertyId, evaluationId),
      });

      const previous = queryClient.getQueryData<Evaluation>(
        evaluationsKeys.detail(propertyId, evaluationId)
      );

      if (previous) {
        queryClient.setQueryData<Evaluation>(
          evaluationsKeys.detail(propertyId, evaluationId),
          {
            ...previous,
            saleCompGroup: {
              ...previous.saleCompGroup,
              saleComps: previous.saleCompGroup.saleComps.map((comp) =>
                comp.id === compId ? { ...comp, include } : comp
              ),
            },
          }
        );
      }

      return { previous };
    },
    onError: (_err, { propertyId, evaluationId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          evaluationsKeys.detail(propertyId, evaluationId),
          context.previous
        );
      }
    },
    onSuccess: (updatedEvaluation, { propertyId, evaluationId }) => {
      queryClient.setQueryData(
        evaluationsKeys.detail(propertyId, evaluationId),
        updatedEvaluation
      );
    },
  });
}

/**
 * Hook to update rent comp search
 */
export function useUpdateRentComps() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      evaluationId,
      inputs,
      signal,
    }: {
      propertyId: string;
      evaluationId: string;
      inputs: Partial<RentCompInputs>;
      signal?: AbortSignal;
    }) => evaluationsService.updateRentComps(propertyId, evaluationId, inputs, signal),
    onSuccess: (updatedEvaluation, { propertyId, evaluationId }) => {
      // Preserve include flags from current cache to avoid overwriting toggled comps
      const current = queryClient.getQueryData<Evaluation>(
        evaluationsKeys.detail(propertyId, evaluationId)
      );

      if (current?.rentCompGroup?.rentComps && updatedEvaluation.rentCompGroup?.rentComps) {
        const includeMap = new Map(
          current.rentCompGroup.rentComps.map((c) => [c.id, c.include])
        );

        updatedEvaluation = {
          ...updatedEvaluation,
          rentCompGroup: {
            ...updatedEvaluation.rentCompGroup,
            rentComps: updatedEvaluation.rentCompGroup.rentComps.map((comp) => ({
              ...comp,
              // Preserve include flag if comp existed before, otherwise use server value
              include: includeMap.has(comp.id) ? includeMap.get(comp.id)! : comp.include,
            })),
          },
        };
      }

      queryClient.setQueryData(
        evaluationsKeys.detail(propertyId, evaluationId),
        updatedEvaluation
      );
    },
  });
}

/**
 * Hook to toggle rent comp inclusion
 */
export function useToggleRentCompInclusion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      evaluationId,
      compId,
      include,
    }: {
      propertyId: string;
      evaluationId: string;
      compId: string;
      include: boolean;
    }) =>
      evaluationsService.toggleRentCompInclusion(
        propertyId,
        evaluationId,
        compId,
        include
      ),
    onMutate: async ({ propertyId, evaluationId, compId, include }) => {
      // Optimistic update
      await queryClient.cancelQueries({
        queryKey: evaluationsKeys.detail(propertyId, evaluationId),
      });

      const previous = queryClient.getQueryData<Evaluation>(
        evaluationsKeys.detail(propertyId, evaluationId)
      );

      if (previous) {
        queryClient.setQueryData<Evaluation>(
          evaluationsKeys.detail(propertyId, evaluationId),
          {
            ...previous,
            rentCompGroup: {
              ...previous.rentCompGroup,
              rentComps: previous.rentCompGroup.rentComps.map((comp) =>
                comp.id === compId ? { ...comp, include } : comp
              ),
            },
          }
        );
      }

      return { previous };
    },
    onError: (_err, { propertyId, evaluationId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          evaluationsKeys.detail(propertyId, evaluationId),
          context.previous
        );
      }
    },
    onSuccess: (updatedEvaluation, { propertyId, evaluationId }) => {
      queryClient.setQueryData(
        evaluationsKeys.detail(propertyId, evaluationId),
        updatedEvaluation
      );
    },
  });
}

/**
 * Hook to update calculator values
 */
export function useUpdateCalculator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      evaluationId,
      dealTermInputs,
      conventionalInputs,
      hardMoneyInputs,
    }: {
      propertyId: string;
      evaluationId: string;
      dealTermInputs?: Partial<DealTermInputs>;
      conventionalInputs?: Partial<ConventionalInputs>;
      hardMoneyInputs?: Partial<HardMoneyInputs>;
    }) =>
      evaluationsService.updateCalculator(
        propertyId,
        evaluationId,
        dealTermInputs,
        conventionalInputs,
        hardMoneyInputs
      ),
    onSuccess: (updatedEvaluation, { propertyId, evaluationId }) => {
      queryClient.setQueryData(
        evaluationsKeys.detail(propertyId, evaluationId),
        updatedEvaluation
      );
    },
  });
}

/**
 * Hook to update evaluation notes
 */
export function useUpdateNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      evaluationId,
      notes,
    }: {
      propertyId: string;
      evaluationId: string;
      notes: string;
    }) => evaluationsService.updateNotes(propertyId, evaluationId, notes),
    onMutate: async ({ propertyId, evaluationId, notes }) => {
      // Optimistic update
      await queryClient.cancelQueries({
        queryKey: evaluationsKeys.detail(propertyId, evaluationId),
      });

      const previous = queryClient.getQueryData<Evaluation>(
        evaluationsKeys.detail(propertyId, evaluationId)
      );

      if (previous) {
        queryClient.setQueryData<Evaluation>(
          evaluationsKeys.detail(propertyId, evaluationId),
          { ...previous, notes }
        );
      }

      return { previous };
    },
    onError: (_err, { propertyId, evaluationId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          evaluationsKeys.detail(propertyId, evaluationId),
          context.previous
        );
      }
    },
    onSuccess: (updatedEvaluation, { propertyId, evaluationId }) => {
      queryClient.setQueryData(
        evaluationsKeys.detail(propertyId, evaluationId),
        updatedEvaluation
      );
    },
  });
}

/**
 * Hook to update property attributes on an evaluation
 */
export function useUpdateAttributes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      evaluationId,
      attributes,
    }: {
      propertyId: string;
      evaluationId: string;
      attributes: {
        beds?: number;
        baths?: number;
        garage?: number;
        sqft?: number;
        yearBuilt?: number;
        subdivision?: string;
        county?: string;
        listPrice?: number;
        listDate?: string;
        mlsMarket?: string;
        taxesAnnual?: number;
        hoaAnnual?: number;
        name?: string;
      };
    }) =>
      evaluationsService.updateAttributes(propertyId, evaluationId, attributes),
    onMutate: async ({ propertyId, evaluationId, attributes }) => {
      // Optimistic update for instant feedback
      await queryClient.cancelQueries({
        queryKey: evaluationsKeys.detail(propertyId, evaluationId),
      });

      const previous = queryClient.getQueryData<Evaluation>(
        evaluationsKeys.detail(propertyId, evaluationId)
      );

      if (previous) {
        queryClient.setQueryData<Evaluation>(
          evaluationsKeys.detail(propertyId, evaluationId),
          { ...previous, ...attributes }
        );
      }

      return { previous };
    },
    onError: (_err, { propertyId, evaluationId }, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(
          evaluationsKeys.detail(propertyId, evaluationId),
          context.previous
        );
      }
    },
    onSuccess: (updatedEvaluation, { propertyId, evaluationId }) => {
      queryClient.setQueryData(
        evaluationsKeys.detail(propertyId, evaluationId),
        updatedEvaluation
      );
      // Also invalidate property to update evaluations list (for ScenarioHistory)
      queryClient.invalidateQueries({
        queryKey: propertiesKeys.detail(propertyId),
      });
    },
  });
}

/**
 * Hook to generate PDF
 *
 * Strategy:
 * - In production (when Quest5 is deployed): Uses backend Restpack API
 * - In development (localhost): Opens print-optimized page for browser print-to-PDF
 */
export function useExportPdf() {
  return useMutation({
    mutationFn: async ({
      propertyId,
      evaluationId,
    }: {
      propertyId: string;
      evaluationId: string;
    }) => {
      // Get session key for the print page
      const sessionData = sessionStorage.getItem('session');
      if (!sessionData) {
        throw new Error('No session found');
      }
      const session = JSON.parse(sessionData);
      const sessionKey = session.sessionKey;

      // Check if we're running locally
      const isLocalhost = window.location.hostname === 'localhost' ||
                          window.location.hostname === '127.0.0.1';

      if (isLocalhost) {
        // Local development: Open print page in new window for browser print-to-PDF
        const printUrl = `/properties/${propertyId}/evaluations/${evaluationId}/sessions/${sessionKey}`;
        const printWindow = window.open(printUrl, '_blank');

        if (!printWindow) {
          throw new Error('Could not open print window. Please allow popups for this site.');
        }

        // Wait for the page to load, then trigger print
        printWindow.onload = () => {
          // Give a moment for styles to apply
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };

        return;
      }

      // Production: Use backend Restpack API
      // Send the frontend origin so the backend knows which domain to use for Restpack
      const frontendOrigin = window.location.origin;

      let response;
      try {
        response = await apiClient.get(
          `properties/${propertyId}/evaluations/${evaluationId}/pdf`,
          {
            responseType: 'blob',
            headers: {
              'X-Frontend-Origin': frontendOrigin
            }
          }
        );
      } catch (error) {
        // Try to extract error details from the response
        if (axios.isAxiosError(error) && error.response) {
          const errorData = error.response.data;
          // If it's a blob, convert to text
          if (errorData instanceof Blob) {
            const text = await errorData.text();
            console.error('PDF API error response:', text);
            throw new Error(`PDF generation failed: ${text}`);
          }
          console.error('PDF API error:', errorData);
          throw new Error(`PDF generation failed: ${JSON.stringify(errorData)}`);
        }
        throw error;
      }

      // Check if we got a valid PDF response
      const contentType = response.headers['content-type'];
      if (!contentType?.includes('application/pdf')) {
        const text = await response.data.text();
        console.error('PDF generation failed. Response:', text);
        throw new Error('PDF generation failed - unexpected response from server');
      }

      // Verify the blob starts with PDF magic bytes (%PDF)
      const arrayBuffer = await response.data.slice(0, 5).arrayBuffer();
      const header = new TextDecoder().decode(arrayBuffer);
      if (!header.startsWith('%PDF')) {
        throw new Error('PDF generation failed - received invalid PDF content');
      }

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'evaluation.pdf';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '');
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

/**
 * Hook to email evaluation
 */
export function useEmailEvaluation() {
  return useMutation({
    mutationFn: ({
      propertyId,
      evaluationId,
      to,
      subject,
      message,
    }: {
      propertyId: string;
      evaluationId: string;
      to: string;
      subject: string;
      message: string;
    }) =>
      evaluationsService.emailEvaluation(
        propertyId,
        evaluationId,
        to,
        subject,
        message
      ),
  });
}

/**
 * Hook to share evaluation
 */
export function useShareEvaluation() {
  return useMutation({
    mutationFn: ({
      propertyId,
      evaluationId,
    }: {
      propertyId: string;
      evaluationId: string;
    }) => evaluationsService.shareEvaluation(propertyId, evaluationId),
  });
}
