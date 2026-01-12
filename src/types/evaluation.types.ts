/**
 * Evaluation types for single-family property analysis
 */

// ============================================================================
// SALE COMP TYPES
// ============================================================================

/**
 * Search inputs for finding sale comparables
 */
export interface SaleCompInputs {
  searchType: string;
  searchTerm: string;
  sqftPlusMinus: number;
  bedsMin: number;
  bedsMax: number;
  bathsMin: number;
  bathsMax: number;
  garageMin: number;
  garageMax: number;
  yearBuiltPlusMinus: number;
  monthsClosed: number;
  confineToCounty: string;
  confineToZip: string;
  ignoreParametersExceptMonthsClosed: boolean;
}

/**
 * Individual sale comparable property
 */
export interface SaleComp {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  beds: number;
  baths: number;
  garage: number;
  yearBuilt: number;
  sqft: number;
  subdivision: string;
  market: string;
  mlsNumber: string;
  priceListed: number;
  priceSold: number;
  dateSold: string;
  daysOnMarket: number;
  photoURLs: string[];
  include: boolean;
  pricePerSqft: number;
  latitude?: number;
  longitude?: number;
  distanceMiles?: number;
}

/**
 * Trend data for sale comps over time
 */
export interface CompTrend {
  description: string;
  avgSalePrice: number;
  avgPricePerSqFt: number;
}

/**
 * Complete sale comp group with inputs, comps, and calculations
 */
export interface SaleCompGroup {
  saleCompInputs: SaleCompInputs;
  initialSaleCompInputs?: SaleCompInputs; // Immutable - set once on evaluation creation
  saleComps: SaleComp[];
  calculatedValue: number;
  averageSalePrice: number;
  averagePricePerSqft: number;
  trends: CompTrend[];
  counties: string[];
  zips: string[];
}

// ============================================================================
// RENT COMP TYPES
// ============================================================================

/**
 * Search inputs for finding rent comparables
 */
export interface RentCompInputs {
  searchType: string;
  searchTerm: string;
  sqftPlusMinus: number;
  bedsMin: number;
  bedsMax: number;
  bathsMin: number;
  bathsMax: number;
  garageMin: number;
  garageMax: number;
  yearBuiltPlusMinus: number;
  monthsClosed: number;
  confineToCounty: string;
  confineToZip: string;
  ignoreParametersExceptMonthsClosed: boolean;
}

/**
 * Individual rent comparable property
 */
export interface RentComp {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  beds: number;
  baths: number;
  garage: number;
  yearBuilt: number;
  sqft: number;
  subdivision: string;
  market: string;
  priceSold: number; // Rent amount (API uses priceSold for rent comps)
  daysOnMarket: number;
  photoURLs: string[];
  include: boolean;
  pricePerSqft: number;
  latitude?: number;
  longitude?: number;
  distanceMiles?: number;
}

/**
 * Complete rent comp group with inputs, comps, and calculations
 */
export interface RentCompGroup {
  rentCompInputs: RentCompInputs;
  initialRentCompInputs?: RentCompInputs; // Immutable - set once on evaluation creation
  rentComps: RentComp[];
  calculatedValue: number;
  averageRentPrice: number;
  averagePricePerSqft: number;
  trends: CompTrend[];
  counties: string[];
  zips: string[];
}

// ============================================================================
// CALCULATOR TYPES
// ============================================================================

/**
 * Deal term inputs - core property economics
 */
export interface DealTermInputs {
  estimatedMarketValue: number;
  estimatedAppraisedValue: number;
  purchasePrice: number;
  sellerContribution: number;
  survey: number;
  appraisal: number;
  inspection: number;
  repairsMakeReady: number;
  hoaAnnual: number;
  propertyTaxAnnual: number;
  propertyInsuranceAnnual: number;
  miscellaneousMonthly: number;
  rent: number;
  maxRefiCashback: number;
}

/**
 * Conventional financing inputs
 */
export interface ConventionalInputs {
  show: boolean;
  downPaymentPercent: number;
  loanTermInYears: number;
  interestRatePercent: number;
  lenderAndTitleFees: number;
  monthsTaxAndInsurance: number;
  mortgageInsuranceAnnual: number;
}

/**
 * Hard money financing inputs
 */
export interface HardMoneyInputs {
  show: boolean;
  hardLoanToValuePercent: number;
  hardLenderAndTitleFees: number;
  hardInterestRate: number;
  hardMonthsToRefinance: number;
  hardRollInLenderFees: boolean;
  hardWeeksUntilLeased: number;
  refinanceLoanToValuePercent: number;
  refinanceLoanTermInYears: number;
  refinanceInterestRatePercent: number;
  refinanceLenderAndTitleFees: number;
  refinanceMonthsTaxAndInsurance: number;
  refinanceMortgageInsuranceAnnual: number;
}

/**
 * Complete calculator with all inputs and calculated values
 */
export interface Calculator {
  // Inputs
  dealTermInputs: DealTermInputs;
  conventionalInputs: ConventionalInputs;
  hardMoneyInputs: HardMoneyInputs;

  // Calculated - Conventional
  conventionalMonthlyRent: number;
  conventionalNotePaymentMonthly: number;
  conventionalPropertyTaxMonthly: number;
  conventionalPropertyInsuranceMonthly: number;
  conventionalMortgageInsuranceMonthly: number;
  conventionalHoaMonthly: number;
  conventionalMiscellaneousMonthly: number;
  conventionalTotalCashflowMonthly: number;
  conventionalUnrealizedCapitalGain: number;
  conventionalAnnualCashFlow: number;
  conventionalReturnOnCapitalGainPercent: number;
  conventionalCashOnCashReturnPercent: number;
  conventionalDownpayment: number;
  conventionalClosingCosts: number;
  conventionalPrepaidExpenses: number;
  conventionalRepairsMakeReady: number;
  conventionalCashOutOfPocketTotal: number;
  conventionalLoanAmount: number;

  // Calculated - Hard Money
  hardCashToClose: number;
  hardHoldingCost: number;
  hardRefiCashToClose: number;
  hardRefiCashBack: number;
  hardCashOutOfPocketTotal: number;
  hardUnrealizedCapitalGain: number;
  hardAnnualCashFlow: number;
  hardReturnOnCapitalGainPercent: number;
  hardCashOnCashReturnPercent: number;
  hardLoanAmount: number;
  hardRefiLoanAmount: number;
  hardRefinanceNotePaymentMonthly: number;
  hardMonthlyRent: number;
  hardPropertyTaxMonthly: number;
  hardPropertyInsuranceMonthly: number;
  hardMortgageInsuranceMonthly: number;
  hardHoaMonthly: number;
  hardMiscellaneousMonthly: number;
  hardTotalCashflowMonthly: number;
}

// ============================================================================
// EVALUATION TYPES
// ============================================================================

/**
 * Available search types for finding comps
 */
export interface SearchType {
  type: string;
  defaultSearchTerm: string;
}

/**
 * Complete evaluation entity
 */
export interface Evaluation {
  id: string;
  propertyId: string;
  created: string;

  // Property attributes (can be edited per evaluation)
  beds: number;
  baths: number;
  garage: number;
  sqft: number;
  yearBuilt: number;
  subdivision: string;
  county: string;

  // Listing info
  listPrice: number;
  listDate: string;
  mlsMarket: string;
  mlsNumber: string;
  listingOfficeName: string;
  dateSold: string;

  // Expenses
  taxesAnnual: number;
  hoaAnnual: number;

  // Data source
  compDataSource: string;

  // Notes (HTML content)
  notes: string;

  // Optional scenario name
  name?: string;

  // Comp groups
  saleCompGroup: SaleCompGroup;
  rentCompGroup: RentCompGroup;

  // Calculator
  calculator: Calculator;
}

/**
 * Summary of an evaluation (for lists)
 */
export interface EvaluationSummary {
  id: string;
  created: string;
  notes: string;
  name?: string;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  garage: number;
  listPrice: number;
  taxesAnnual: number;
  hoaAnnual: number;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * Request to update sale comp search
 */
export interface UpdateSaleCompsRequest {
  propertyId: string;
  evaluationId: string;
  inputs: Partial<SaleCompInputs>;
}

/**
 * Request to update rent comp search
 */
export interface UpdateRentCompsRequest {
  propertyId: string;
  evaluationId: string;
  inputs: Partial<RentCompInputs>;
}

/**
 * Request to include/exclude a comp
 */
export interface ToggleCompInclusionRequest {
  propertyId: string;
  evaluationId: string;
  compId: string;
  include: boolean;
}

/**
 * Request to update calculator values
 */
export interface UpdateCalculatorRequest {
  propertyId: string;
  evaluationId: string;
  dealTermInputs?: Partial<DealTermInputs>;
  conventionalInputs?: Partial<ConventionalInputs>;
  hardMoneyInputs?: Partial<HardMoneyInputs>;
}

/**
 * Request to update evaluation notes
 */
export interface UpdateNotesRequest {
  propertyId: string;
  evaluationId: string;
  notes: string;
}

/**
 * Request to update property attributes on an evaluation
 */
export interface UpdateAttributesRequest {
  propertyId: string;
  evaluationId: string;
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
}

/**
 * Request to email an evaluation
 */
export interface EmailEvaluationRequest {
  propertyId: string;
  evaluationId: string;
  to: string;
  subject: string;
  message: string;
}

// ============================================================================
// SHARING TYPES
// ============================================================================

/**
 * Active share link for an evaluation
 * Anyone with the link can view the evaluation (no auth required)
 */
export interface ActiveShare {
  shareId: string;
  shareUrl: string;
  guid: string;
  createdAt: string;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default sale comp search inputs
 */
export const DEFAULT_SALE_COMP_INPUTS: SaleCompInputs = {
  searchType: 'subdivision',
  searchTerm: '',
  sqftPlusMinus: 200,
  bedsMin: 0,
  bedsMax: 10,
  bathsMin: 0,
  bathsMax: 10,
  garageMin: 0,
  garageMax: 10,
  yearBuiltPlusMinus: 10,
  monthsClosed: 6,
  confineToCounty: '',
  confineToZip: '',
  ignoreParametersExceptMonthsClosed: false,
};

/**
 * Default rent comp search inputs
 */
export const DEFAULT_RENT_COMP_INPUTS: RentCompInputs = {
  searchType: 'subdivision',
  searchTerm: '',
  sqftPlusMinus: 200,
  bedsMin: 0,
  bedsMax: 10,
  bathsMin: 0,
  bathsMax: 10,
  garageMin: 0,
  garageMax: 10,
  yearBuiltPlusMinus: 10,
  monthsClosed: 6,
  confineToCounty: '',
  confineToZip: '',
  ignoreParametersExceptMonthsClosed: false,
};

/**
 * Default conventional loan inputs
 */
export const DEFAULT_CONVENTIONAL_INPUTS: ConventionalInputs = {
  show: true,
  downPaymentPercent: 20,
  loanTermInYears: 30,
  interestRatePercent: 7.0,
  lenderAndTitleFees: 3000,
  monthsTaxAndInsurance: 3,
  mortgageInsuranceAnnual: 0,
};

/**
 * Default hard money loan inputs
 */
export const DEFAULT_HARD_MONEY_INPUTS: HardMoneyInputs = {
  show: true,
  hardLoanToValuePercent: 70,
  hardLenderAndTitleFees: 3000,
  hardInterestRate: 12,
  hardMonthsToRefinance: 6,
  hardRollInLenderFees: false,
  hardWeeksUntilLeased: 4,
  refinanceLoanToValuePercent: 75,
  refinanceLoanTermInYears: 30,
  refinanceInterestRatePercent: 7.0,
  refinanceLenderAndTitleFees: 3000,
  refinanceMonthsTaxAndInsurance: 3,
  refinanceMortgageInsuranceAnnual: 0,
};
