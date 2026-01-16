import type { ProductStatusResponse, Session } from '@app-types/auth.types';

/**
 * Mock product status responses for different scenarios
 */
export const mockProductStatusResponses = {
  /** User can create a new subscription (no existing account) */
  createSubscription: {
    billingPortalUrl: '',
    subscriptionStatus: 'None',
    signInUrl: '',
    nextCall: 'CreateSubscription',
    price: 97,
    interval: 1,
    intervalUnit: 'month',
    trialInterval: 0,
    trialIntervalUnit: '',
    trialEndDate: '',
  } as ProductStatusResponse,

  /** User already has an active subscription - should sign in */
  signIn: {
    billingPortalUrl: '',
    subscriptionStatus: 'Active',
    signInUrl: '/signin',
    nextCall: 'SignIn',
    price: 97,
    interval: 1,
    intervalUnit: 'month',
    trialInterval: 0,
    trialIntervalUnit: '',
    trialEndDate: '',
  } as ProductStatusResponse,

  /** User has cancelled subscription - needs to reactivate */
  reactivate: {
    billingPortalUrl: 'https://billing.example.com/portal',
    subscriptionStatus: 'Canceled',
    signInUrl: '/signin',
    nextCall: 'Reactivate',
    price: 97,
    interval: 1,
    intervalUnit: 'month',
    trialInterval: 0,
    trialIntervalUnit: '',
    trialEndDate: '',
  } as ProductStatusResponse,

  /** User subscription is on hold - needs to resume */
  resume: {
    billingPortalUrl: 'https://billing.example.com/portal',
    subscriptionStatus: 'OnHold',
    signInUrl: '/signin',
    nextCall: 'Resume',
    price: 97,
    interval: 1,
    intervalUnit: 'month',
    trialInterval: 0,
    trialIntervalUnit: '',
    trialEndDate: '',
  } as ProductStatusResponse,

  /** User needs to access billing portal */
  billingPortal: {
    billingPortalUrl: 'https://billing.example.com/portal',
    subscriptionStatus: 'PastDue',
    signInUrl: '/signin',
    nextCall: 'BillingPortal',
    price: 97,
    interval: 1,
    intervalUnit: 'month',
    trialInterval: 0,
    trialIntervalUnit: '',
    trialEndDate: '',
  } as ProductStatusResponse,
};

/**
 * Mock session for successful sign-in
 */
export const mockSession: Session = {
  sessionKey: 'test-session-key-123',
  user: {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    preferences: {
      mlsMarket: 'AUS',
      state: 'TX',
      evaluationSalePlusMinusSqft: 200,
      evaluationSalePlusMinusYearBuilt: 5,
      evaluationSaleMonthsClosed: 6,
      evaluationRentPlusMinusSqft: 200,
      evaluationRentPlusMinusYearBuilt: 5,
      evaluationRentMonthsClosed: 6,
      evaluationRadius: 1,
      dealSurvey: 500,
      dealAppraisal: 500,
      dealInspection: 500,
      dealPropertyInsurancePercentListPrice: 0.5,
      dealPropertyTaxPercentListPrice: 2.5,
      dealRepairs: 5000,
      dealMaxRefiCashback: 50000,
      conventionalDownPayment: 25,
      conventionalInterestRate: 7.5,
      conventionalLenderFeesPercentOfListPrice: 1,
      conventionalMonthsTaxEscrow: 3,
      conventionalLoanTermInYears: 30,
      hardLoanToValuePercent: 75,
      hardLenderFeesPercentOfListPrice: 3,
      hardInterestRate: 12,
      hardMonthsUntilRefi: 6,
      hardRollInLenderFees: true,
      hardWeeksUntilLeased: 8,
      hardRefiLoanToValue: 75,
      hardRefiLoanTermInYears: 30,
      hardRefiInterestRate: 7.5,
      hardRefiLenderFeesPercentListPrice: 1,
      hardRefiMonthsTaxEscrow: 3,
    },
  },
  rights: {
    admin: false,
    agent: false,
    search: true,
    searchFree: false,
    preferred: false,
  },
};

/**
 * Mock user ID returned from subscription creation
 */
export const mockUserId = 'new-user-id-456';
