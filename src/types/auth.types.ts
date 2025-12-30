/**
 * User rights/permissions
 */
export interface UserRights {
  admin: boolean;
  search: boolean;
  searchFree: boolean;
  preferred: boolean;
}

/**
 * User preferences for evaluations and deal defaults
 */
export interface UserPreferences {
  // Location defaults
  mlsMarket: string;
  state: string;

  // Evaluation sale comp search defaults
  evaluationSalePlusMinusSqft: number;
  evaluationSalePlusMinusYearBuilt: number;
  evaluationSaleMonthsClosed: number;

  // Evaluation rent comp search defaults
  evaluationRentPlusMinusSqft: number;
  evaluationRentPlusMinusYearBuilt: number;
  evaluationRentMonthsClosed: number;
  evaluationRadius: number;

  // Deal cost defaults
  dealSurvey: number;
  dealAppraisal: number;
  dealInspection: number;
  dealPropertyInsurancePercentListPrice: number;
  dealPropertyTaxPercentListPrice: number;
  dealRepairs: number;
  dealMaxRefiCashback: number;

  // Conventional financing defaults
  conventionalDownPayment: number;
  conventionalInterestRate: number;
  conventionalLenderFeesPercentOfListPrice: number;
  conventionalMonthsTaxEscrow: number;
  conventionalLoanTermInYears: number;

  // Hard money financing defaults
  hardLoanToValuePercent: number;
  hardLenderFeesPercentOfListPrice: number;
  hardInterestRate: number;
  hardMonthsUntilRefi: number;
  hardRollInLenderFees: boolean;
  hardWeeksUntilLeased: number;
  hardRefiLoanToValue: number;
  hardRefiLoanTermInYears: number;
  hardRefiInterestRate: number;
  hardRefiLenderFeesPercentListPrice: number;
}

/**
 * User account information
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferences: UserPreferences;
}

/**
 * Authentication session returned from sign-in
 */
export interface Session {
  sessionKey: string;
  user: User;
  rights: UserRights;
}

/**
 * Sign-in request credentials
 */
export interface SignInCredentials {
  email: string;
  password: string;
}

/**
 * Subscription creation request (sent to Authenticator API)
 */
export interface CreateSubscriptionRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  // Billing info
  firstNameOnCard: string;
  lastNameOnCard: string;
  cardNumber: string;
  cardExpMonth: string;
  cardExpYear: string;
  cardCvv: string;
}

/**
 * Subscription status response
 */
export type SubscriptionStatus = 'active' | 'cancelled' | 'on_hold' | 'none';

/**
 * Reactivation request
 */
export interface ReactivateRequest {
  email: string;
  password: string;
}

/**
 * Auth context state
 */
export interface AuthState {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
