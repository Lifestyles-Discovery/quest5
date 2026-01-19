/**
 * User rights/permissions
 * Note: Backend sends 'agent' for agent capability (RightsEnum.Agent)
 */
export interface UserRights {
  admin: boolean;
  agent: boolean;
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
  hardRefiMonthsTaxEscrow: number;
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
  // Trial period from URL param (e.g., 'Days7', 'Days14', 'None')
  trialPeriod?: string;
}

/**
 * Simple subscription status (legacy)
 */
export type SubscriptionStatus = 'active' | 'cancelled' | 'on_hold' | 'none';

/**
 * Backend subscription status values
 */
export type SubscriptionStatusValue = 'Active' | 'Canceled' | 'OnHold' | 'None' | 'Trialing' | 'PastDue';

/**
 * Backend NextCall enum values - what action the user should take
 */
export type NextCallValue =
  | 'AddSubscriptionNoCC'
  | 'AddSubscriptionWithCC'
  | 'BillingPortal'
  | 'CreateSubscription'
  | 'None'
  | 'Reactivate'
  | 'Resume'
  | 'SignIn';

/**
 * Full subscription status response from /subscriptions/status endpoint
 * Used to determine what action a user should take during sign-up flow
 * Note: API returns camelCase property names
 */
export interface ProductStatusResponse {
  billingPortalUrl: string;
  subscriptionStatus: SubscriptionStatusValue;
  signInUrl: string;
  nextCall: NextCallValue;
  price: number;
  interval: number;
  intervalUnit: string;
  trialInterval: number;
  trialIntervalUnit: string;
  trialEndDate: string;
}

/**
 * Reactivation request (simple - for resume)
 */
export interface ReactivateRequest {
  email: string;
  password: string;
}

/**
 * Reactivation request with credit card (for cancelled subscriptions)
 * Matches Quest4's reactivation flow which allows updating payment method
 */
export interface ReactivateSubscriptionRequest {
  userId: string;
  firstNameOnCard: string;
  lastNameOnCard: string;
  cardNumber: string;
  cardExpMonth: string;
  cardExpYear: string;
  cardCvv: string;
}

/**
 * Auth context state
 */
export interface AuthState {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
