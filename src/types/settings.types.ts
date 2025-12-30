import type { UserPreferences } from './auth.types';

/**
 * Account update form data
 */
export interface AccountFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Optional - leave blank to keep current
}

/**
 * Preferences form data (same as UserPreferences but all optional for partial updates)
 */
export type PreferencesFormData = Partial<UserPreferences>;

/**
 * Default preferences with suggested values
 */
export const DEFAULT_PREFERENCES: UserPreferences = {
  // Location defaults
  mlsMarket: '',
  state: '',

  // Evaluation sale comp search defaults
  evaluationSalePlusMinusSqft: 250,
  evaluationSalePlusMinusYearBuilt: 5,
  evaluationSaleMonthsClosed: 6,

  // Evaluation rent comp search defaults
  evaluationRentPlusMinusSqft: 250,
  evaluationRentPlusMinusYearBuilt: 5,
  evaluationRentMonthsClosed: 6,
  evaluationRadius: 1,

  // Deal cost defaults
  dealSurvey: 400,
  dealAppraisal: 400,
  dealInspection: 400,
  dealPropertyInsurancePercentListPrice: 1.2,
  dealPropertyTaxPercentListPrice: 2.5,
  dealRepairs: 0,
  dealMaxRefiCashback: 2000,

  // Conventional financing defaults
  conventionalDownPayment: 20,
  conventionalInterestRate: 7,
  conventionalLenderFeesPercentOfListPrice: 4,
  conventionalMonthsTaxEscrow: 0,
  conventionalLoanTermInYears: 30,

  // Hard money financing defaults
  hardLoanToValuePercent: 70,
  hardLenderFeesPercentOfListPrice: 8,
  hardInterestRate: 14,
  hardMonthsUntilRefi: 3,
  hardRollInLenderFees: true,
  hardWeeksUntilLeased: 8,
  hardRefiLoanToValue: 75,
  hardRefiLoanTermInYears: 30,
  hardRefiInterestRate: 5,
  hardRefiLenderFeesPercentListPrice: 4,
};
