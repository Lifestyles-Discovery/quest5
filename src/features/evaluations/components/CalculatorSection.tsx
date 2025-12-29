import { useState, useCallback } from 'react';
import { useUpdateCalculator } from '@/hooks/api/useEvaluations';
import type {
  Evaluation,
  DealTermInputs,
  ConventionalInputs,
  HardMoneyInputs,
} from '@app-types/evaluation.types';
import { debounce } from '@/utils/debounce';

interface CalculatorSectionProps {
  propertyId: string;
  evaluationId: string;
  evaluation: Evaluation;
}

type TabType = 'deal' | 'conventional' | 'hardmoney';

export default function CalculatorSection({
  propertyId,
  evaluationId,
  evaluation,
}: CalculatorSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('deal');
  const calculator = evaluation.calculator;

  const updateCalculator = useUpdateCalculator();

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce(
      (
        dealTermInputs?: Partial<DealTermInputs>,
        conventionalInputs?: Partial<ConventionalInputs>,
        hardMoneyInputs?: Partial<HardMoneyInputs>
      ) => {
        updateCalculator.mutate({
          propertyId,
          evaluationId,
          dealTermInputs,
          conventionalInputs,
          hardMoneyInputs,
        });
      },
      500
    ),
    [propertyId, evaluationId]
  );

  const handleDealTermChange = (field: keyof DealTermInputs, value: number) => {
    debouncedUpdate({ [field]: value }, undefined, undefined);
  };

  const handleConventionalChange = (field: keyof ConventionalInputs, value: number | boolean) => {
    debouncedUpdate(undefined, { [field]: value }, undefined);
  };

  const handleHardMoneyChange = (field: keyof HardMoneyInputs, value: number | boolean) => {
    debouncedUpdate(undefined, undefined, { [field]: value });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (!calculator) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Calculator data not available</p>
      </div>
    );
  }

  const { dealTermInputs, conventionalInputs, hardMoneyInputs } = calculator;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Header with Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('deal')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'deal'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Deal Terms
          </button>
          <button
            onClick={() => setActiveTab('conventional')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'conventional'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Conventional
          </button>
          <button
            onClick={() => setActiveTab('hardmoney')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'hardmoney'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Hard Money / BRRRR
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Deal Terms Tab */}
        {activeTab === 'deal' && (
          <div className="space-y-6">
            {/* Property Values */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Property Values
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                <InputField
                  label="Est. Market Value"
                  value={dealTermInputs.estimatedMarketValue}
                  onChange={(v) => handleDealTermChange('estimatedMarketValue', v)}
                  prefix="$"
                />
                <InputField
                  label="Est. Appraised Value"
                  value={dealTermInputs.estimatedAppraisedValue}
                  onChange={(v) => handleDealTermChange('estimatedAppraisedValue', v)}
                  prefix="$"
                />
                <InputField
                  label="Purchase Price"
                  value={dealTermInputs.purchasePrice}
                  onChange={(v) => handleDealTermChange('purchasePrice', v)}
                  prefix="$"
                />
                <InputField
                  label="Seller Contribution"
                  value={dealTermInputs.sellerContribution}
                  onChange={(v) => handleDealTermChange('sellerContribution', v)}
                  prefix="$"
                />
              </div>
            </div>

            {/* Closing Costs */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Closing Costs
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                <InputField
                  label="Survey"
                  value={dealTermInputs.survey}
                  onChange={(v) => handleDealTermChange('survey', v)}
                  prefix="$"
                />
                <InputField
                  label="Appraisal"
                  value={dealTermInputs.appraisal}
                  onChange={(v) => handleDealTermChange('appraisal', v)}
                  prefix="$"
                />
                <InputField
                  label="Inspection"
                  value={dealTermInputs.inspection}
                  onChange={(v) => handleDealTermChange('inspection', v)}
                  prefix="$"
                />
                <InputField
                  label="Repairs / Make-Ready"
                  value={dealTermInputs.repairsMakeReady}
                  onChange={(v) => handleDealTermChange('repairsMakeReady', v)}
                  prefix="$"
                />
              </div>
            </div>

            {/* Monthly Expenses */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Annual / Monthly Expenses
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                <InputField
                  label="Property Tax (Annual)"
                  value={dealTermInputs.propertyTaxAnnual}
                  onChange={(v) => handleDealTermChange('propertyTaxAnnual', v)}
                  prefix="$"
                />
                <InputField
                  label="Insurance (Annual)"
                  value={dealTermInputs.propertyInsuranceAnnual}
                  onChange={(v) => handleDealTermChange('propertyInsuranceAnnual', v)}
                  prefix="$"
                />
                <InputField
                  label="HOA (Annual)"
                  value={dealTermInputs.hoaAnnual}
                  onChange={(v) => handleDealTermChange('hoaAnnual', v)}
                  prefix="$"
                />
                <InputField
                  label="Misc (Monthly)"
                  value={dealTermInputs.miscellaneousMonthly}
                  onChange={(v) => handleDealTermChange('miscellaneousMonthly', v)}
                  prefix="$"
                />
              </div>
            </div>

            {/* Income */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Income
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                <InputField
                  label="Monthly Rent"
                  value={dealTermInputs.rent}
                  onChange={(v) => handleDealTermChange('rent', v)}
                  prefix="$"
                />
                <InputField
                  label="Max Refi Cashback"
                  value={dealTermInputs.maxRefiCashback}
                  onChange={(v) => handleDealTermChange('maxRefiCashback', v)}
                  prefix="$"
                />
              </div>
            </div>
          </div>
        )}

        {/* Conventional Tab */}
        {activeTab === 'conventional' && (
          <div className="space-y-6">
            {/* Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={conventionalInputs.show}
                onChange={(e) => handleConventionalChange('show', e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Include Conventional Analysis
              </span>
            </div>

            {conventionalInputs.show && (
              <>
                {/* Loan Terms */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                    Loan Terms
                  </h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    <InputField
                      label="Down Payment %"
                      value={conventionalInputs.downPaymentPercent}
                      onChange={(v) => handleConventionalChange('downPaymentPercent', v)}
                      suffix="%"
                    />
                    <InputField
                      label="Loan Term (Years)"
                      value={conventionalInputs.loanTermInYears}
                      onChange={(v) => handleConventionalChange('loanTermInYears', v)}
                    />
                    <InputField
                      label="Interest Rate %"
                      value={conventionalInputs.interestRatePercent}
                      onChange={(v) => handleConventionalChange('interestRatePercent', v)}
                      suffix="%"
                      step={0.125}
                    />
                    <InputField
                      label="Lender/Title Fees"
                      value={conventionalInputs.lenderAndTitleFees}
                      onChange={(v) => handleConventionalChange('lenderAndTitleFees', v)}
                      prefix="$"
                    />
                    <InputField
                      label="Months Tax/Ins Escrow"
                      value={conventionalInputs.monthsTaxAndInsurance}
                      onChange={(v) => handleConventionalChange('monthsTaxAndInsurance', v)}
                    />
                    <InputField
                      label="Mortgage Ins (Annual)"
                      value={conventionalInputs.mortgageInsuranceAnnual}
                      onChange={(v) => handleConventionalChange('mortgageInsuranceAnnual', v)}
                      prefix="$"
                    />
                  </div>
                </div>

                {/* Calculated Results */}
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                    Conventional Results
                  </h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    <ResultField label="Loan Amount" value={formatCurrency(calculator.conventionalLoanAmount)} />
                    <ResultField label="Cash to Close" value={formatCurrency(calculator.conventionalCashToClose)} />
                    <ResultField label="Monthly Payment" value={formatCurrency(calculator.conventionalNotePaymentMonthly)} />
                    <ResultField label="Monthly Cashflow" value={formatCurrency(calculator.conventionalTotalCashflowMonthly)} highlight />
                    <ResultField label="Annual Cashflow" value={formatCurrency(calculator.conventionalAnnualCashFlow)} />
                    <ResultField label="Cash-on-Cash Return" value={formatPercent(calculator.conventionalCashOnCashReturnPercent)} highlight />
                    <ResultField label="Unrealized Gain" value={formatCurrency(calculator.conventionalUnrealizedCapitalGain)} />
                    <ResultField label="Return on Gain" value={formatPercent(calculator.conventionalReturnOnCapitalGainPercent)} />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Hard Money Tab */}
        {activeTab === 'hardmoney' && (
          <div className="space-y-6">
            {/* Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={hardMoneyInputs.show}
                onChange={(e) => handleHardMoneyChange('show', e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Include Hard Money / BRRRR Analysis
              </span>
            </div>

            {hardMoneyInputs.show && (
              <>
                {/* Hard Money Loan */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                    Hard Money Loan
                  </h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    <InputField
                      label="LTV %"
                      value={hardMoneyInputs.hardLoanToValuePercent}
                      onChange={(v) => handleHardMoneyChange('hardLoanToValuePercent', v)}
                      suffix="%"
                    />
                    <InputField
                      label="Interest Rate %"
                      value={hardMoneyInputs.hardInterestRate}
                      onChange={(v) => handleHardMoneyChange('hardInterestRate', v)}
                      suffix="%"
                    />
                    <InputField
                      label="Lender/Title Fees"
                      value={hardMoneyInputs.hardLenderAndTitleFees}
                      onChange={(v) => handleHardMoneyChange('hardLenderAndTitleFees', v)}
                      prefix="$"
                    />
                    <InputField
                      label="Months to Refi"
                      value={hardMoneyInputs.hardMonthsToRefinance}
                      onChange={(v) => handleHardMoneyChange('hardMonthsToRefinance', v)}
                    />
                    <InputField
                      label="Weeks Until Leased"
                      value={hardMoneyInputs.hardWeeksUntilLeased}
                      onChange={(v) => handleHardMoneyChange('hardWeeksUntilLeased', v)}
                    />
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={hardMoneyInputs.hardRollInLenderFees}
                        onChange={(e) => handleHardMoneyChange('hardRollInLenderFees', e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Roll in Lender Fees
                      </span>
                    </div>
                  </div>
                </div>

                {/* Refinance Loan */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                    Refinance Loan
                  </h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    <InputField
                      label="Refi LTV %"
                      value={hardMoneyInputs.refinanceLoanToValuePercent}
                      onChange={(v) => handleHardMoneyChange('refinanceLoanToValuePercent', v)}
                      suffix="%"
                    />
                    <InputField
                      label="Refi Term (Years)"
                      value={hardMoneyInputs.refinanceLoanTermInYears}
                      onChange={(v) => handleHardMoneyChange('refinanceLoanTermInYears', v)}
                    />
                    <InputField
                      label="Refi Interest Rate %"
                      value={hardMoneyInputs.refinanceInterestRatePercent}
                      onChange={(v) => handleHardMoneyChange('refinanceInterestRatePercent', v)}
                      suffix="%"
                      step={0.125}
                    />
                    <InputField
                      label="Refi Lender/Title Fees"
                      value={hardMoneyInputs.refinanceLenderAndTitleFees}
                      onChange={(v) => handleHardMoneyChange('refinanceLenderAndTitleFees', v)}
                      prefix="$"
                    />
                    <InputField
                      label="Months Tax/Ins Escrow"
                      value={hardMoneyInputs.refinanceMonthsTaxAndInsurance}
                      onChange={(v) => handleHardMoneyChange('refinanceMonthsTaxAndInsurance', v)}
                    />
                    <InputField
                      label="Mortgage Ins (Annual)"
                      value={hardMoneyInputs.refinanceMortgageInsuranceAnnual}
                      onChange={(v) => handleHardMoneyChange('refinanceMortgageInsuranceAnnual', v)}
                      prefix="$"
                    />
                  </div>
                </div>

                {/* Calculated Results */}
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                    BRRRR Results
                  </h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    <ResultField label="Hard Money Loan" value={formatCurrency(calculator.hardLoanAmount)} />
                    <ResultField label="Cash to Close" value={formatCurrency(calculator.hardCashToClose)} />
                    <ResultField label="Holding Cost" value={formatCurrency(calculator.hardHoldingCost)} />
                    <ResultField label="Refi Loan Amount" value={formatCurrency(calculator.hardRefiLoanAmount)} />
                    <ResultField label="Refi Cash to Close" value={formatCurrency(calculator.hardRefiCashToClose)} />
                    <ResultField label="Cash Back at Refi" value={formatCurrency(calculator.hardRefiCashBack)} highlight />
                    <ResultField label="Total Out of Pocket" value={formatCurrency(calculator.hardCashOutOfPocketTotal)} highlight />
                    <ResultField label="Monthly Payment" value={formatCurrency(calculator.hardRefiNotePaymentMonthly)} />
                    <ResultField label="Monthly Cashflow" value={formatCurrency(calculator.hardRefiTotalCashflowMonthly)} highlight />
                    <ResultField label="Annual Cashflow" value={formatCurrency(calculator.hardAnnualCashFlow)} />
                    <ResultField label="Cash-on-Cash Return" value={formatPercent(calculator.hardCashOnCashReturnPercent)} highlight />
                    <ResultField label="Unrealized Gain" value={formatCurrency(calculator.hardUnrealizedCapitalGain)} />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Input field component
interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
}

function InputField({ label, value, onChange, prefix, suffix, step = 1 }: InputFieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="mt-1 flex items-center">
        {prefix && <span className="mr-1 text-sm text-gray-500">{prefix}</span>}
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="block w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700"
        />
        {suffix && <span className="ml-1 text-sm text-gray-500">{suffix}</span>}
      </div>
    </div>
  );
}

// Result field component
interface ResultFieldProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function ResultField({ label, value, highlight }: ResultFieldProps) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p
        className={`text-sm font-semibold ${
          highlight
            ? 'text-green-600 dark:text-green-400'
            : 'text-gray-900 dark:text-white'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
