import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  FprSearchParams,
  FprSearchResponse,
  ForSalesParams,
  ForSaleProperty,
  SearchHistoryItem,
  InvestmentAssessment,
  AiAnalysisResponse,
  MlsMarket,
  StateOption,
} from '@app-types/search.types';

/**
 * Search service for FPR analysis, investment assessment, and property discovery
 */
export const searchService = {
  /**
   * Search for properties using FPR (Feature-to-Price Ratio) analysis
   */
  async getFprAnalysis(params: FprSearchParams): Promise<FprSearchResponse> {
    const response = await apiClient.get<FprSearchResponse>(
      ENDPOINTS.search.fprAnalysis,
      {
        headers: {
          cities: params.cities,
          state: params.state,
          resultLimit: String(params.resultLimit || 100),
          daysOnMarket: String(params.daysOnMarket || 30),
        },
      }
    );
    return response.data;
  },

  /**
   * Search for sales listings (legacy search)
   */
  async getForSales(params: ForSalesParams): Promise<ForSaleProperty[]> {
    const response = await apiClient.get<ForSaleProperty[]>(
      ENDPOINTS.search.forSales,
      {
        headers: {
          state: params.state,
          ...(params.cities && { cities: params.cities }),
          ...(params.zips && { zips: params.zips }),
          daysBack: String(params.daysBack || 30),
        },
      }
    );
    return response.data;
  },

  /**
   * Get search history
   */
  async getSearchHistory(maxCount: number = 50): Promise<SearchHistoryItem[]> {
    const response = await apiClient.get<SearchHistoryItem[]>(
      ENDPOINTS.search.forSalesHistory(maxCount)
    );
    return response.data;
  },

  /**
   * Get investment assessment for a property
   */
  async getInvestmentAssessment(propertyId: string): Promise<InvestmentAssessment> {
    const response = await apiClient.get<InvestmentAssessment>(
      ENDPOINTS.search.investmentAssessment,
      {
        headers: {
          propertyId,
        },
      }
    );
    return response.data;
  },

  /**
   * Get AI-powered investment analysis
   */
  async getAiAnalysis(assessment: InvestmentAssessment): Promise<AiAnalysisResponse> {
    const response = await apiClient.post<AiAnalysisResponse>(
      ENDPOINTS.search.aiAnalysis,
      assessment
    );
    return response.data;
  },

  /**
   * Create a property with evaluation from search results
   */
  async createPropertyWithEvaluation(
    mlsMarket: string,
    mlsNumber: string
  ): Promise<{ propertyId: string; id: string }> {
    const response = await apiClient.post<{ propertyId: string; id: string }>(
      ENDPOINTS.search.createPropertyWithEvaluation,
      null,
      {
        headers: {
          mlsMarket,
          mlsNumber,
        },
      }
    );
    return response.data;
  },

  /**
   * Get available MLS markets
   */
  async getMlsMarkets(): Promise<MlsMarket[]> {
    const response = await apiClient.get<MlsMarket[]>(ENDPOINTS.helpers.mlsMarkets);
    return response.data;
  },

  /**
   * Get list of US states
   */
  async getStates(): Promise<StateOption[]> {
    const response = await apiClient.get<StateOption[]>(ENDPOINTS.helpers.states);
    return response.data;
  },
};
