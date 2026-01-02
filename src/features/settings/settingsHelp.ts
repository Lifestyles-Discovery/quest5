// Helper text for investor settings
// Each entry has a suggested value and explanation

export const SETTINGS_HELP = {
  // Location Defaults
  mlsMarket:
    'Select the MLS Market where you plan to do most of your investing. If your MLS is not listed here then select "Not Set".',
  state:
    'Select the State where you plan to do most of your investing. If you don\'t have a primary State, select "Not Set".',

  // Evaluation Inputs - Sale Comps
  evaluationSalePlusMinusSqft:
    'Suggested: 250. How close in square feet sales comps will be to your subject property.',
  evaluationSalePlusMinusYearBuilt:
    'Suggested: 5. Within how many years sales comp houses were built compared to your subject property.',
  evaluationSaleMonthsClosed:
    'Suggested: 6. Within how many months since today sales comp properties were sold.',

  // Evaluation Inputs - Rent Comps
  evaluationRentPlusMinusSqft:
    'Suggested: 250. How close in square feet rental comps will be to your subject property.',
  evaluationRentPlusMinusYearBuilt:
    'Suggested: 5. Within how many years rental comp houses were built compared to your subject property.',
  evaluationRentMonthsClosed:
    'Suggested: 6. Within how many months since today rental comp properties were rented out.',
  evaluationRadius:
    'Suggested: 1. How many miles to include in a radius search. You can use decimals like 1.5 for one and a half miles.',

  // Deal Inputs
  dealSurvey:
    'Suggested: $500. How much it costs to purchase a survey. Adjust when you have a more accurate number for your market.',
  dealAppraisal:
    'Suggested: $450. How much it costs to purchase an appraisal. Adjust when you have a more accurate number for your market.',
  dealInspection:
    'Suggested: $450. How much it costs to perform an inspection with a licensed inspector. Adjust for your market.',
  dealPropertyInsurancePercentListPrice:
    'Suggested: 0.8%. Rough estimate of insurance cost as a percentage of property value. Rates vary by state.',
  dealPropertyTaxPercentListPrice:
    'Suggested: 1.8%. Rough estimate of property tax as a percentage of property value. The default is appropriate for Texas—adjust for your location.',
  dealRepairs:
    'Suggested: $0. Default repair estimate. Each property will have different needs, so plan to enter an amount on each evaluation.',
  dealMaxRefiCashback:
    'Suggested: $2,000. Maximum cash you can receive back when refinancing a hard-money loan. Most lenders cap this at $2,000.',

  // Conventional Financing
  conventionalDownPayment:
    'Suggested: 20%. Default down payment percentage of the purchase price used in financial calculations.',
  conventionalInterestRate:
    'Suggested: 7%. Default interest rate used in financial calculations. Adjust based on current market rates.',
  conventionalLenderFeesPercentOfListPrice:
    'Suggested: 3%. Conventional financing cost as a percentage of the purchase price.',
  conventionalMonthsTaxEscrow:
    'Suggested: 0. Months of principal and interest added to closing costs if you escrow. Set to 0 if you don\'t escrow.',
  conventionalLoanTermInYears: 'Suggested: 30. Most conventional loans are 30-year loans.',

  // Hard Money Financing
  hardLoanToValuePercent:
    'Suggested: 70%. Hard-money lenders only lend up to a percentage of the after-repaired value.',
  hardLenderFeesPercentOfListPrice:
    'Suggested: 3%. Hard-money origination points. Check with your lender for exact fees.',
  hardInterestRate:
    'Suggested: 11%. Hard-money loans typically have higher interest rates than conventional. Check with your lender for exact rates.',
  hardMonthsUntilRefi:
    'Suggested: 3. How many months from when the hard-money loan funds to when the refi loan pays it off.',
  hardRollInLenderFees:
    'Suggested: Yes. If your hard-money lender lets you include their fees in the loan, set this to Yes.',
  hardWeeksUntilLeased: 'Suggested: 8. How many weeks until you have a tenant.',

  // Refinance Terms
  hardRefiLoanToValue:
    'Suggested: 75%. Refinance loans usually only lend up to a percentage of the after-repaired estimated sale price.',
  hardRefiLoanTermInYears: 'Suggested: 30. Most refinance loans have 30-year terms.',
  hardRefiInterestRate: 'Suggested: 7%. The interest rate for the refinance loan. Adjust based on current market rates.',
  hardRefiLenderFeesPercentListPrice:
    'Suggested: 3%. Refinance financing cost as a percentage of the purchase price.',
  hardRefiMonthsTaxEscrow:
    'Suggested: 0. Months of principal and interest added to closing costs for the refinance if you escrow. Set to 0 if you don\'t escrow.',
} as const;

export type SettingKey = keyof typeof SETTINGS_HELP;
