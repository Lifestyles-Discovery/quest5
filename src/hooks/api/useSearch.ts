import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchService } from '@services/search.service';
import { propertiesKeys } from './useProperties';
import type {
  FprSearchParams,
  InvestmentAssessment,
} from '@app-types/search.types';

/**
 * Query keys for search
 */
export const searchKeys = {
  all: ['search'] as const,
  fpr: (params: FprSearchParams) => [...searchKeys.all, 'fpr', params] as const,
  forSales: (state: string, cities?: string, zips?: string) =>
    [...searchKeys.all, 'forSales', state, cities, zips] as const,
  history: (maxCount: number) => [...searchKeys.all, 'history', maxCount] as const,
  assessment: (propertyId: string) =>
    [...searchKeys.all, 'assessment', propertyId] as const,
  aiAnalysis: (propertyId: string) =>
    [...searchKeys.all, 'aiAnalysis', propertyId] as const,
  mlsMarkets: () => [...searchKeys.all, 'mlsMarkets'] as const,
  states: () => [...searchKeys.all, 'states'] as const,
};

/**
 * Hook for FPR (Feature-to-Price Ratio) search
 */
export function useFprSearch(params: FprSearchParams | null) {
  return useQuery({
    queryKey: params ? searchKeys.fpr(params) : ['search', 'fpr', 'disabled'],
    queryFn: () => searchService.getFprAnalysis(params!),
    enabled: !!params && !!params.cities && !!params.state,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for triggering FPR search manually
 */
export function useFprSearchMutation() {
  return useMutation({
    mutationFn: (params: FprSearchParams) => searchService.getFprAnalysis(params),
  });
}

/**
 * Hook for legacy For Sales search
 */
export function useForSalesSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: searchService.getForSales,
    onSuccess: () => {
      // Refresh search history after a search
      queryClient.invalidateQueries({ queryKey: searchKeys.history(50) });
    },
  });
}

/**
 * Hook to fetch search history
 */
export function useSearchHistory(maxCount: number = 50) {
  return useQuery({
    queryKey: searchKeys.history(maxCount),
    queryFn: () => searchService.getSearchHistory(maxCount),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch investment assessment for a property
 */
export function useInvestmentAssessment(propertyId: string | null) {
  return useQuery({
    queryKey: propertyId ? searchKeys.assessment(propertyId) : ['search', 'assessment', 'disabled'],
    queryFn: () => searchService.getInvestmentAssessment(propertyId!),
    enabled: !!propertyId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get AI investment analysis
 */
export function useAiAnalysis() {
  return useMutation({
    mutationFn: (assessment: InvestmentAssessment) =>
      searchService.getAiAnalysis(assessment),
  });
}

/**
 * Hook to create property with evaluation from search
 */
export function useCreatePropertyFromSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mlsMarket, mlsNumber }: { mlsMarket: string; mlsNumber: string }) =>
      searchService.createPropertyWithEvaluation(mlsMarket, mlsNumber),
    onSuccess: () => {
      // Invalidate properties list to include new property
      queryClient.invalidateQueries({ queryKey: propertiesKeys.all });
    },
  });
}

/**
 * Hook to fetch MLS markets
 */
export function useMlsMarkets() {
  return useQuery({
    queryKey: searchKeys.mlsMarkets(),
    queryFn: () => searchService.getMlsMarkets(),
    staleTime: Infinity, // MLS markets rarely change
  });
}

/**
 * Hook to fetch US states
 */
export function useStates() {
  return useQuery({
    queryKey: searchKeys.states(),
    queryFn: () => searchService.getStates(),
    staleTime: Infinity, // States don't change
  });
}
