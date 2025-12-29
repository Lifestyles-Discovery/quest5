/**
 * Property stage in the investment workflow
 */
export type PropertyStage =
  | 'None'
  | 'Finding'
  | 'Evaluating'
  | 'Negotiating'
  | 'Diligence'
  | 'Closing'
  | 'Rehabbing'
  | 'Leasing'
  | 'Selling';

/**
 * All available property stages
 */
export const PROPERTY_STAGES: PropertyStage[] = [
  'None',
  'Finding',
  'Evaluating',
  'Negotiating',
  'Diligence',
  'Closing',
  'Rehabbing',
  'Leasing',
  'Selling',
];

/**
 * Stage colors for UI display
 */
export const STAGE_COLORS: Record<PropertyStage, string> = {
  None: 'gray',
  Finding: 'blue',
  Evaluating: 'purple',
  Negotiating: 'yellow',
  Diligence: 'orange',
  Closing: 'red',
  Rehabbing: 'pink',
  Leasing: 'teal',
  Selling: 'green',
};

/**
 * Property summary (returned from list endpoint)
 */
export interface PropertySummary {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  photoUrl: string;
  propertyType: 'Singlefamily';
  stage: PropertyStage;
  lastUpdate: string;
  evaluationCount: number;
  connectionCount: number;
  noteCount: number;
  documentCount: number;
}

/**
 * Full property detail (returned from single property endpoint)
 */
export interface Property extends PropertySummary {
  photoUrls: string[];
  latitude: number;
  longitude: number;
  evaluations: PropertyEvaluation[];
  connections: PropertyConnection[];
  notes: PropertyNote[];
  documents: PropertyDocument[];
  listings: PropertyListing[];
}

/**
 * Property evaluation summary (nested in property)
 */
export interface PropertyEvaluation {
  id: string;
  createdUtc: string;
  notes: string;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  garage: number;
  listPrice: number;
  taxesAnnual: number;
  hoaAnnual: number;
}

/**
 * Property connection summary (nested in property)
 */
export interface PropertyConnection {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string;
}

/**
 * Property note summary (nested in property)
 */
export interface PropertyNote {
  id: string;
  createdUtc: string;
  stage: PropertyStage;
  theNote: string;
}

/**
 * Property document summary (nested in property)
 */
export interface PropertyDocument {
  id: string;
  name: string;
  type: string;
  s3Key: string;
  size: number;
  uploadedUtc: string;
}

/**
 * Property listing summary (nested in property)
 */
export interface PropertyListing {
  id: string;
  title: string;
  isActive: boolean;
  availableDate: string;
}

/**
 * Filter options for properties list
 */
export interface PropertiesFilter {
  searchTerm: string;
  stages: PropertyStage[];
  useDates: boolean;
  startDate: Date;
  endDate: Date;
}

/**
 * Default filter state
 */
export const DEFAULT_PROPERTIES_FILTER: PropertiesFilter = {
  searchTerm: '',
  stages: [...PROPERTY_STAGES],
  useDates: false,
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  endDate: new Date(),
};

/**
 * Request to create property by address
 */
export interface CreatePropertyByAddressRequest {
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Request to create property by MLS
 */
export interface CreatePropertyByMlsRequest {
  mlsMarket: string;
  mlsNumber: string;
}
