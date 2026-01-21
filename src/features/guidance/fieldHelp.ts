// Help text for evaluation fields
// Each entry provides guidance when help mode is enabled for that section

export const FIELD_HELP = {
  // ==========================================================================
  // Deal Terms - Primary Fields
  // ==========================================================================
  purchasePrice: 'The agreed price you will pay for the property.',
  estimatedMarketValue:
    'What the property is worth today based on comparable sales. Use your sale comps median or adjusted value.',
  estimatedAppraisedValue:
    'The value a hard money lender will use to calculate your loan amount (LTV). Often conservative compared to market value.',
  rent: 'Expected monthly rent once the property is leased. Use your rent comps median or adjusted value.',
  repairsMakeReady:
    'Estimated cost to get the property rent-ready. Include materials, labor, permits, and contingency.',

  // ==========================================================================
  // Deal Terms - Secondary Fields
  // ==========================================================================
  propertyTaxAnnual:
    'Annual property tax. Check the county tax assessor website for the most accurate number.',
  propertyInsuranceAnnual:
    'Annual property insurance premium. Get quotes from your insurance agent for accuracy.',
  hoaAnnual:
    'Annual HOA dues if applicable. Verify with the HOA or listing agent.',
  survey:
    'Cost of a property survey. Required by most lenders to verify property boundaries.',
  appraisal:
    'Cost of a professional appraisal. Required by lenders to verify property value.',
  inspection:
    'Cost of a home inspection. Highly recommended to identify repair needs before closing.',
  sellerContribution:
    'Seller credits toward your closing costs. Negotiate this as part of your offer.',
  maxRefiCashback:
    'Maximum cash you can receive back when refinancing. Most lenders cap this at $2,000.',
  miscMonthly:
    'Any other monthly expenses not captured elsewhere (lawn care, pest control, etc.).',

  // ==========================================================================
  // Conventional Financing
  // ==========================================================================
  conventionalDownPaymentPercent:
    'Percentage of purchase price paid upfront. Standard is 20% to avoid PMI (private mortgage insurance).',
  conventionalInterestRate:
    'Annual interest rate on your loan. Shop multiple lenders to find the best rate.',
  conventionalLenderAndTitleFees:
    'Combined closing costs from lender and title company. Include: origination points, title insurance, attorney fees, and recording fees.',
  conventionalMonthsTaxEscrow:
    'Months of taxes prepaid into escrow at closing. Set to 0 if you pay taxes directly.',

  // ==========================================================================
  // Hard Money Financing
  // ==========================================================================
  hardLoanToValuePercent:
    'Percentage of appraised value the lender will loan. Typical hard money LTV is 65-75%.',
  hardLenderAndTitleFees:
    'Include: origination points, title insurance, attorney fees, builders risk policy, hard money appraisal, and recording fees.',
  hardInterestRate:
    'Annual interest rate on hard money loan. Rates are higher than conventional (typically 10-14%).',
  hardMonthsToRefi:
    'Months from purchase to refinance. Account for repairs, tenant lease-up, and refi processing time.',
  hardRollInLenderFees:
    'Whether lender fees are included in the loan amount. Rolling in reduces cash needed at close.',
  hardWeeksUntilLeased:
    'Weeks until you have a paying tenant. Affects how much rent income offsets holding costs.',

  // ==========================================================================
  // Refinance Terms
  // ==========================================================================
  refiLoanToValuePercent:
    'Percentage of appraised value for refi loan. Typical refi LTV is 70-80%.',
  refiInterestRate:
    'Annual interest rate on refinance loan. Usually similar to conventional rates.',
  refiLenderAndTitleFees:
    'Refinance closing costs. Include: origination points, title insurance, appraisal, and recording fees.',
  refiMonthsTaxEscrow:
    'Months of taxes prepaid into escrow at refi closing. Set to 0 if you pay taxes directly.',

  // ==========================================================================
  // Comp Filters
  // ==========================================================================
  searchMode:
    'Subdivision limits comps to the same neighborhood. Radius searches a geographic circle around the property.',
  bedsRange:
    'Match properties with similar bedroom count. Buyers compare homes with similar bed counts.',
  bathsRange:
    'Match properties with similar bathroom count. Half baths count toward this.',
  garageRange:
    'Match properties with similar garage capacity. 0 = no garage, 2 = 2-car garage.',
  sqftTolerance:
    'How close in square feet comps should be. Wider range = more comps, narrower = more accurate.',
  yearBuiltTolerance:
    'How close in year built comps should be. Older and newer homes have different values.',
  monthsClosed:
    'How recent the sales/rentals should be. Recent data reflects current market conditions.',
  broadSearch:
    'Broad search ignores beds, baths, sqft, and year filters. Use when you need more comps in a thin market.',
} as const;

export type FieldHelpKey = keyof typeof FIELD_HELP;
