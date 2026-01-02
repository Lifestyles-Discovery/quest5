import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  Evaluation,
  SaleCompInputs,
  RentCompInputs,
  SearchType,
  DealTermInputs,
  ConventionalInputs,
  HardMoneyInputs,
} from '@app-types/evaluation.types';

/**
 * Evaluations service for Liberator API
 */
export const evaluationsService = {
  /**
   * Create a new evaluation for a property
   */
  async createEvaluation(propertyId: string): Promise<Evaluation> {
    const response = await apiClient.post<Evaluation>(
      ENDPOINTS.evaluations.create(propertyId)
    );
    return response.data;
  },

  /**
   * Delete an evaluation
   */
  async deleteEvaluation(
    propertyId: string,
    evaluationId: string
  ): Promise<void> {
    await apiClient.delete(
      ENDPOINTS.evaluations.delete(propertyId, evaluationId)
    );
  },

  /**
   * Copy an evaluation to create a new one
   */
  async copyEvaluation(
    propertyId: string,
    evaluationId: string
  ): Promise<Evaluation> {
    const response = await apiClient.post<Evaluation>(
      ENDPOINTS.evaluations.copy(propertyId, evaluationId)
    );
    return response.data;
  },

  /**
   * Get available search types for comps
   */
  async getSearchTypes(
    propertyId: string,
    evaluationId: string
  ): Promise<SearchType[]> {
    const response = await apiClient.get<SearchType[]>(
      ENDPOINTS.evaluations.getSearchTypes(propertyId, evaluationId)
    );
    return response.data;
  },

  /**
   * Update sale comp search parameters and get new comps
   */
  async updateSaleComps(
    propertyId: string,
    evaluationId: string,
    inputs: Partial<SaleCompInputs>,
    signal?: AbortSignal
  ): Promise<Evaluation> {
    const response = await apiClient.put<Evaluation>(
      ENDPOINTS.evaluations.updateSaleComps(propertyId, evaluationId),
      {},
      {
        signal,
        headers: {
          searchType: inputs.searchType ?? '',
          searchTerm: inputs.searchTerm ?? '',
          sqftPlusMinus: String(inputs.sqftPlusMinus ?? ''),
          bedsMin: String(inputs.bedsMin ?? ''),
          bedsMax: String(inputs.bedsMax ?? ''),
          bathsMin: String(inputs.bathsMin ?? ''),
          bathsMax: String(inputs.bathsMax ?? ''),
          garageMin: String(inputs.garageMin ?? ''),
          garageMax: String(inputs.garageMax ?? ''),
          yearBuiltPlusMinus: String(inputs.yearBuiltPlusMinus ?? ''),
          monthsClosed: String(inputs.monthsClosed ?? ''),
          confineToCounty: String(inputs.confineToCounty ?? false),
          confineToZip: String(inputs.confineToZip ?? false),
          ignoreParametersExceptMonthsClosed: String(
            inputs.ignoreParametersExceptMonthsClosed ?? false
          ),
        },
      }
    );
    return response.data;
  },

  /**
   * Include or exclude a sale comp from calculations
   */
  async toggleSaleCompInclusion(
    propertyId: string,
    evaluationId: string,
    saleCompId: string,
    include: boolean
  ): Promise<Evaluation> {
    const response = await apiClient.put<Evaluation>(
      ENDPOINTS.evaluations.includeSaleComp(propertyId, evaluationId, saleCompId),
      {},
      {
        headers: {
          include: include, // Pass boolean directly like Quest4
        },
      }
    );
    return response.data;
  },

  /**
   * Update rent comp search parameters and get new comps
   */
  async updateRentComps(
    propertyId: string,
    evaluationId: string,
    inputs: Partial<RentCompInputs>,
    signal?: AbortSignal
  ): Promise<Evaluation> {
    const response = await apiClient.put<Evaluation>(
      ENDPOINTS.evaluations.updateRentComps(propertyId, evaluationId),
      {},
      {
        signal,
        headers: {
          searchType: inputs.searchType ?? '',
          searchTerm: inputs.searchTerm ?? '',
          sqftPlusMinus: String(inputs.sqftPlusMinus ?? ''),
          bedsMin: String(inputs.bedsMin ?? ''),
          bedsMax: String(inputs.bedsMax ?? ''),
          bathsMin: String(inputs.bathsMin ?? ''),
          bathsMax: String(inputs.bathsMax ?? ''),
          garageMin: String(inputs.garageMin ?? ''),
          garageMax: String(inputs.garageMax ?? ''),
          yearBuiltPlusMinus: String(inputs.yearBuiltPlusMinus ?? ''),
          monthsClosed: String(inputs.monthsClosed ?? ''),
          confineToCounty: String(inputs.confineToCounty ?? false),
          confineToZip: String(inputs.confineToZip ?? false),
          ignoreParametersExceptMonthsClosed: String(
            inputs.ignoreParametersExceptMonthsClosed ?? false
          ),
        },
      }
    );
    return response.data;
  },

  /**
   * Include or exclude a rent comp from calculations
   */
  async toggleRentCompInclusion(
    propertyId: string,
    evaluationId: string,
    rentCompId: string,
    include: boolean
  ): Promise<Evaluation> {
    const response = await apiClient.put<Evaluation>(
      ENDPOINTS.evaluations.includeRentComp(propertyId, evaluationId, rentCompId),
      {},
      {
        headers: {
          include: include, // Pass boolean directly like Quest4
        },
      }
    );
    return response.data;
  },

  /**
   * Update calculator values
   * Note: Header names must match Quest4 API format with prefixes (deal*, conv*, etc.)
   */
  async updateCalculator(
    propertyId: string,
    evaluationId: string,
    dealTermInputs?: Partial<DealTermInputs>,
    conventionalInputs?: Partial<ConventionalInputs>,
    hardMoneyInputs?: Partial<HardMoneyInputs>
  ): Promise<Evaluation> {
    const headers: Record<string, string> = {};

    // Deal term inputs - API expects "deal" prefix
    if (dealTermInputs) {
      if (dealTermInputs.estimatedMarketValue !== undefined)
        headers.dealEstimatedMarketValue = String(dealTermInputs.estimatedMarketValue);
      if (dealTermInputs.estimatedAppraisedValue !== undefined)
        headers.dealEstimatedAppraisedValue = String(dealTermInputs.estimatedAppraisedValue);
      if (dealTermInputs.purchasePrice !== undefined)
        headers.dealPurchasePrice = String(dealTermInputs.purchasePrice);
      if (dealTermInputs.sellerContribution !== undefined)
        headers.dealSellerContribution = String(dealTermInputs.sellerContribution);
      if (dealTermInputs.survey !== undefined)
        headers.dealSurvey = String(dealTermInputs.survey);
      if (dealTermInputs.appraisal !== undefined)
        headers.dealAppraisal = String(dealTermInputs.appraisal);
      if (dealTermInputs.inspection !== undefined)
        headers.dealInspection = String(dealTermInputs.inspection);
      if (dealTermInputs.repairsMakeReady !== undefined)
        headers.dealRepairsMakeReady = String(dealTermInputs.repairsMakeReady);
      if (dealTermInputs.hoaAnnual !== undefined)
        headers.dealHoaAnnual = String(dealTermInputs.hoaAnnual);
      if (dealTermInputs.propertyTaxAnnual !== undefined)
        headers.dealPropertyTaxAnnual = String(dealTermInputs.propertyTaxAnnual);
      if (dealTermInputs.propertyInsuranceAnnual !== undefined)
        headers.dealPropertyInsuranceAnnual = String(dealTermInputs.propertyInsuranceAnnual);
      if (dealTermInputs.miscellaneousMonthly !== undefined)
        headers.dealMiscellaneousMonthly = String(dealTermInputs.miscellaneousMonthly);
      if (dealTermInputs.rent !== undefined)
        headers.dealRent = String(dealTermInputs.rent);
      if (dealTermInputs.maxRefiCashback !== undefined)
        headers.dealMaxRefiCashback = String(dealTermInputs.maxRefiCashback);
    }

    // Conventional inputs - API expects "conv" prefix
    if (conventionalInputs) {
      if (conventionalInputs.show !== undefined)
        headers.convShow = String(conventionalInputs.show);
      if (conventionalInputs.downPaymentPercent !== undefined)
        headers.convDownpaymentPercent = String(conventionalInputs.downPaymentPercent);
      if (conventionalInputs.loanTermInYears !== undefined)
        headers.convLoanTermInYears = String(conventionalInputs.loanTermInYears);
      if (conventionalInputs.interestRatePercent !== undefined)
        headers.convInterestRatePercent = String(conventionalInputs.interestRatePercent);
      if (conventionalInputs.lenderAndTitleFees !== undefined)
        headers.convLenderAndTitleFees = String(conventionalInputs.lenderAndTitleFees);
      if (conventionalInputs.monthsTaxAndInsurance !== undefined)
        headers.convMonthsTaxAndInsurance = String(conventionalInputs.monthsTaxAndInsurance);
      if (conventionalInputs.mortgageInsuranceAnnual !== undefined)
        headers.convMortgageInsuranceAnnual = String(conventionalInputs.mortgageInsuranceAnnual);
    }

    // Hard money inputs - API expects specific naming
    if (hardMoneyInputs) {
      if (hardMoneyInputs.show !== undefined)
        headers.hardShow = String(hardMoneyInputs.show);
      if (hardMoneyInputs.hardLoanToValuePercent !== undefined)
        headers.hardMoneyLoanToValuePercent = String(hardMoneyInputs.hardLoanToValuePercent);
      if (hardMoneyInputs.hardLenderAndTitleFees !== undefined)
        headers.hardMoneyLenderAndTitleFees = String(hardMoneyInputs.hardLenderAndTitleFees);
      if (hardMoneyInputs.hardInterestRate !== undefined)
        headers.hardMoneyInterestRatePercent = String(hardMoneyInputs.hardInterestRate);
      if (hardMoneyInputs.hardMonthsToRefinance !== undefined)
        headers.hardMoneyMonthsToRefinance = String(hardMoneyInputs.hardMonthsToRefinance);
      if (hardMoneyInputs.hardRollInLenderFees !== undefined)
        headers.hardMoneyRollInLenderFees = String(hardMoneyInputs.hardRollInLenderFees);
      if (hardMoneyInputs.hardWeeksUntilLeased !== undefined)
        headers.hardMoneyWeeksUntilLeased = String(hardMoneyInputs.hardWeeksUntilLeased);
      if (hardMoneyInputs.refinanceLoanToValuePercent !== undefined)
        headers.refinanceLoanToValuePercent = String(hardMoneyInputs.refinanceLoanToValuePercent);
      if (hardMoneyInputs.refinanceLoanTermInYears !== undefined)
        headers.refinanceLoanTermInYears = String(hardMoneyInputs.refinanceLoanTermInYears);
      if (hardMoneyInputs.refinanceInterestRatePercent !== undefined)
        headers.refinanceInterestRatePercent = String(hardMoneyInputs.refinanceInterestRatePercent);
      if (hardMoneyInputs.refinanceLenderAndTitleFees !== undefined)
        headers.refinanceLenderAndTitleFees = String(hardMoneyInputs.refinanceLenderAndTitleFees);
      if (hardMoneyInputs.refinanceMonthsTaxAndInsurance !== undefined)
        headers.refinanceMonthsTaxAndInsurance = String(hardMoneyInputs.refinanceMonthsTaxAndInsurance);
      if (hardMoneyInputs.refinanceMortgageInsuranceAnnual !== undefined)
        headers.refinanceMortgageInsuranceAnnual = String(hardMoneyInputs.refinanceMortgageInsuranceAnnual);
    }

    const response = await apiClient.put<Evaluation>(
      ENDPOINTS.evaluations.updateCalculator(propertyId, evaluationId),
      {},
      { headers }
    );
    return response.data;
  },

  /**
   * Update evaluation notes
   */
  async updateNotes(
    propertyId: string,
    evaluationId: string,
    notes: string
  ): Promise<Evaluation> {
    const response = await apiClient.put<Evaluation>(
      ENDPOINTS.evaluations.updateNotes(propertyId, evaluationId),
      {},
      {
        headers: {
          notes,
        },
      }
    );
    return response.data;
  },

  /**
   * Update property attributes on an evaluation
   */
  async updateAttributes(
    propertyId: string,
    evaluationId: string,
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
    }
  ): Promise<Evaluation> {
    const headers: Record<string, string> = {};

    if (attributes.beds !== undefined) headers.beds = String(attributes.beds);
    if (attributes.baths !== undefined) headers.baths = String(attributes.baths);
    if (attributes.garage !== undefined) headers.garage = String(attributes.garage);
    if (attributes.sqft !== undefined) headers.sqft = String(attributes.sqft);
    if (attributes.yearBuilt !== undefined) headers.yearBuilt = String(attributes.yearBuilt);
    if (attributes.subdivision !== undefined) headers.subdivision = attributes.subdivision;
    if (attributes.county !== undefined) headers.county = attributes.county;
    if (attributes.listPrice !== undefined) headers.listPrice = String(attributes.listPrice);
    if (attributes.listDate !== undefined) headers.listDate = attributes.listDate;
    if (attributes.mlsMarket !== undefined) headers.mlsMarket = attributes.mlsMarket;
    if (attributes.taxesAnnual !== undefined) headers.taxesAnnual = String(attributes.taxesAnnual);
    if (attributes.hoaAnnual !== undefined) headers.hoaAnnual = String(attributes.hoaAnnual);
    if (attributes.name !== undefined) headers.name = attributes.name;

    const response = await apiClient.put<Evaluation>(
      ENDPOINTS.evaluations.updateAttributes(propertyId, evaluationId),
      {},
      { headers }
    );
    return response.data;
  },

  /**
   * Generate PDF for evaluation
   */
  async createPdf(
    propertyId: string,
    evaluationId: string
  ): Promise<{ sessionKey: string }> {
    const response = await apiClient.get<{ sessionKey: string }>(
      ENDPOINTS.evaluations.createPdf(propertyId, evaluationId)
    );
    return response.data;
  },

  /**
   * Get PDF download URL
   */
  async getPdfUrl(
    propertyId: string,
    evaluationId: string,
    sessionKey: string
  ): Promise<{ url: string }> {
    const response = await apiClient.get<{ url: string }>(
      ENDPOINTS.evaluations.getPdfUrl(propertyId, evaluationId, sessionKey)
    );
    return response.data;
  },

  /**
   * Email evaluation to recipients
   */
  async emailEvaluation(
    propertyId: string,
    evaluationId: string,
    to: string,
    subject: string,
    message: string
  ): Promise<void> {
    await apiClient.post(
      ENDPOINTS.evaluations.emailEvaluation(propertyId, evaluationId),
      {},
      {
        headers: {
          to,
          subject,
          message,
        },
      }
    );
  },

  /**
   * Share evaluation (generate shareable link)
   */
  async shareEvaluation(
    propertyId: string,
    evaluationId: string
  ): Promise<{ shareUrl: string }> {
    const response = await apiClient.post<{ shareUrl: string }>(
      ENDPOINTS.evaluations.shareEvaluation(propertyId, evaluationId)
    );
    return response.data;
  },
};
