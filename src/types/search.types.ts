/**
 * Search-related types for FPR analysis, investment assessment, and AI analysis
 */

// =============================================================================
// FPR Search Types
// =============================================================================

export interface FprSearchParams {
  cities: string;
  state: string;
  resultLimit?: number;
  daysOnMarket?: number;
}

export interface RankedProperty {
  id: string;
  rank: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  daysOnMarket: number;
  priceListed: number;
  photoUrl: string;
  fpr: number; // Feature-to-Price Ratio
  relativeFpr: number; // FPR compared to zip code average
  mlsNumber?: string;
  mlsMarket?: string;
}

export interface MarketSummary {
  cities: string;
  state: string;
  totalActiveListings: number;
  medianPricePerSqft: number;
  medianListPrice: number;
  medianDaysOnMarket: number;
}

export interface FprSearchResponse {
  rankedProperties: RankedProperty[];
  marketSummary: MarketSummary;
  noPropertiesFound: boolean;
  lastUpdated: string;
}

// =============================================================================
// For Sales (Legacy Search) Types
// =============================================================================

export interface ForSalesParams {
  state: string;
  cities?: string;
  zips?: string;
  daysBack?: number;
}

export interface ForSaleProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  askingPrice: number;
  daysOnMarket: number;
  photoUrls: string[];
  capitalScore?: number;
  rentScore?: number;
  mlsNumber?: string;
  mlsMarket?: string;
}

export interface SearchHistoryItem {
  id: string;
  cities: string;
  state: string;
  zips?: string;
  daysBack: number;
  resultCount: number;
  searchedAt: string;
}

// =============================================================================
// Investment Assessment Types
// =============================================================================

export interface PropertyDetails {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  mlsNumber: string;
  market: string;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  daysOnMarket: number;
  priceListed: number;
  description: string;
}

export interface ImageGallery {
  mlsPhotos: string[];
}

export interface RehabEstimate {
  totalEstimatedCost: number;
  calculationMethod: string;
  propertyAgeInYears: number;
  costPerSqFt: number;
  costPerYearOfAge: number;
}

export interface GoogleMapsData {
  propertyStreetViewUrl: string;
  additionalStreetViewUrls: string[];
  surroundingAreaStreetViewUrls: string[];
  propertySatelliteViewUrl: string;
  neighborhoodSatelliteViewUrl: string;
}

export interface InvestmentAssessment {
  propertyDetails: PropertyDetails;
  imageGallery: ImageGallery;
  rehabEstimate: RehabEstimate;
  googleMapsData: GoogleMapsData;
}

// =============================================================================
// AI Analysis Types
// =============================================================================

export interface InvestmentSuitability {
  investmentSummary: string;
  investmentPros: string[];
  investmentCons: string[];
}

export interface RehabIssue {
  category: string;
  description: string;
  severityLevel: string;
  estimatedCost: number;
}

export interface RehabAssessment {
  estimatedTotalRehabCost: number;
  rehabCostConfirmation: boolean;
  potentialIssues: RehabIssue[];
  rehabAssessmentSummary: string;
}

export interface NeighborhoodEvaluation {
  neighborhoodClass: string;
  isStable: boolean;
  positiveAttributes: string[];
  concernAreas: string[];
  neighborhoodSummary: string;
}

export interface AnalysisMetadata {
  imagesProcessed: number;
}

export interface AiAnalysisResponse {
  keyInsights: string[];
  investmentSuitability: InvestmentSuitability;
  rehabAssessment: RehabAssessment;
  neighborhoodEvaluation: NeighborhoodEvaluation;
  analysisMetadata: AnalysisMetadata;
  analysisDate: string;
}

// =============================================================================
// Helper Types
// =============================================================================

export interface MlsMarket {
  acronym: string;
  description: string;
}

export interface StateOption {
  code: string;
  name: string;
}

// =============================================================================
// UI State Types
// =============================================================================

export type SortField =
  | 'rank'
  | 'address'
  | 'priceListed'
  | 'beds'
  | 'baths'
  | 'sqft'
  | 'yearBuilt'
  | 'daysOnMarket'
  | 'relativeFpr';

export type SortDirection = 'asc' | 'desc';

export interface SearchSortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface SearchState {
  params: FprSearchParams;
  results: FprSearchResponse | null;
  sortConfig: SearchSortConfig;
  selectedPropertyId: string | null;
  assessment: InvestmentAssessment | null;
  aiAnalysis: AiAnalysisResponse | null;
}
