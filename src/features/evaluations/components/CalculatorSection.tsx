import { useState } from 'react';
import { useUpdateCalculator } from '@/hooks/api/useEvaluations';
import { EditableField } from '@/components/form/EditableField';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import type {
  Evaluation,
  DealTermInputs,
  ConventionalInputs,
  HardMoneyInputs,
} from '@app-types/evaluation.types';

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

  const handleDealTermChange = async (field: keyof DealTermInputs, value: number) => {
    await updateCalculator.mutateAsync({
      propertyId,
      evaluationId,
      dealTermInputs: { [field]: value },
    });
  };

  const handleConventionalChange = async (field: keyof ConventionalInputs, value: number | boolean) => {
    await updateCalculator.mutateAsync({
      propertyId,
      evaluationId,
      conventionalInputs: { [field]: value },
    });
  };

  const handleHardMoneyChange = async (field: keyof HardMoneyInputs, value: number | boolean) => {
    await updateCalculator.mutateAsync({
      propertyId,
      evaluationId,
      hardMoneyInputs: { [field]: value },
    });
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
                ? 'border-b-2 border-primary text-primary dark:text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Deal Terms
          </button>
          <button
            onClick={() => setActiveTab('conventional')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'conventional'
                ? 'border-b-2 border-primary text-primary dark:text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Conventional
          </button>
          <button
            onClick={() => setActiveTab('hardmoney')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'hardmoney'
                ? 'border-b-2 border-primary text-primary dark:text-white'
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
                <EditableField
                  label="Est. Market Value"
                  value={dealTermInputs.estimatedMarketValue}
                  format="currency"
                  onSave={(v) => handleDealTermChange('estimatedMarketValue', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Est. Appraised Value"
                  value={dealTermInputs.estimatedAppraisedValue}
                  format="currency"
                  onSave={(v) => handleDealTermChange('estimatedAppraisedValue', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Purchase Price"
                  value={dealTermInputs.purchasePrice}
                  format="currency"
                  onSave={(v) => handleDealTermChange('purchasePrice', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Seller Contribution"
                  value={dealTermInputs.sellerContribution}
                  format="currency"
                  onSave={(v) => handleDealTermChange('sellerContribution', v as number)}
                  size="sm"
                />
              </div>
            </div>

            {/* Closing Costs */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Closing Costs
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                <EditableField
                  label="Survey"
                  value={dealTermInputs.survey}
                  format="currency"
                  onSave={(v) => handleDealTermChange('survey', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Appraisal"
                  value={dealTermInputs.appraisal}
                  format="currency"
                  onSave={(v) => handleDealTermChange('appraisal', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Inspection"
                  value={dealTermInputs.inspection}
                  format="currency"
                  onSave={(v) => handleDealTermChange('inspection', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Repairs / Make-Ready"
                  value={dealTermInputs.repairsMakeReady}
                  format="currency"
                  onSave={(v) => handleDealTermChange('repairsMakeReady', v as number)}
                  size="sm"
                />
              </div>
            </div>

            {/* Monthly Expenses */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Annual / Monthly Expenses
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                <EditableField
                  label="Property Tax (Annual)"
                  value={dealTermInputs.propertyTaxAnnual}
                  format="currency"
                  onSave={(v) => handleDealTermChange('propertyTaxAnnual', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Insurance (Annual)"
                  value={dealTermInputs.propertyInsuranceAnnual}
                  format="currency"
                  onSave={(v) => handleDealTermChange('propertyInsuranceAnnual', v as number)}
                  size="sm"
                />
                <EditableField
                  label="HOA (Annual)"
                  value={dealTermInputs.hoaAnnual}
                  format="currency"
                  onSave={(v) => handleDealTermChange('hoaAnnual', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Misc (Monthly)"
                  value={dealTermInputs.miscellaneousMonthly}
                  format="currency"
                  onSave={(v) => handleDealTermChange('miscellaneousMonthly', v as number)}
                  size="sm"
                />
              </div>
            </div>

            {/* Income */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Income
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                <EditableField
                  label="Monthly Rent"
                  value={dealTermInputs.rent}
                  format="currency"
                  onSave={(v) => handleDealTermChange('rent', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Max Refi Cashback"
                  value={dealTermInputs.maxRefiCashback}
                  format="currency"
                  onSave={(v) => handleDealTermChange('maxRefiCashback', v as number)}
                  size="sm"
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
                    <EditableField
                      label="Down Payment %"
                      value={conventionalInputs.downPaymentPercent}
                      format="percent"
                      onSave={(v) => handleConventionalChange('downPaymentPercent', v as number)}
                      size="sm"
                    />
                    <EditableField
                      label="Loan Term (Years)"
                      value={conventionalInputs.loanTermInYears}
                      format="number"
                      onSave={(v) => handleConventionalChange('loanTermInYears', v as number)}
                      size="sm"
                    />
                    <EditableField
                      label="Interest Rate %"
                      value={conventionalInputs.interestRatePercent}
                      format="percent"
                      step={0.125}
                      onSave={(v) => handleConventionalChange('interestRatePercent', v as number)}
                      size="sm"
                    />
                    <EditableField
                      label="Lender/Title Fees"
                      value={conventionalInputs.lenderAndTitleFees}
                      format="currency"
                      onSave={(v) => handleConventionalChange('lenderAndTitleFees', v as number)}
                      size="sm"
                    />
                    <EditableField
                      label="Months Tax/Ins Escrow"
                      value={conventionalInputs.monthsTaxAndInsurance}
                      format="number"
                      onSave={(v) => handleConventionalChange('monthsTaxAndInsurance', v as number)}
                      size="sm"
                    />
                    <EditableField
                      label="Mortgage Ins (Annual)"
                      value={conventionalInputs.mortgageInsuranceAnnual}
                      format="currency"
                      onSave={(v) => handleConventionalChange('mortgageInsuranceAnnual', v as number)}
                      size="sm"
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
                    <ResultField label="Cash-on-Cash Return" value={formatPercent(calculator.conventionalCashOnCashReturnPercent, 1)} highlight />
                    <ResultField label="Unrealized Gain" value={formatCurrency(calculator.conventionalUnrealizedCapitalGain)} />
                    <ResultField label="Return on Gain" value={formatPercent(calculator.conventionalReturnOnCapitalGainPercent, 1)} />
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
                    <EditableField
                      label="LTV %"
                      value={hardMoneyInputs.hardLoanToValuePercent}
                      format="percent"
                      onSave={(v) => handleHardMoneyChange('hardLoanToValuePercent', v as number)}
                      size="sm"
                    />
                    <EditableField
                      label="Interest Rate %"
                      value={hardMoneyInputs.hardInterestRate}
                      format="percent"
                      onSave={(v) => handleHardMoneyChange('hardInterestRate', v as number)}
                      size="sm"
                    />
                    <EditableField
                      label="Lender/Title Fees"
                      value={hardMoneyInputs.hardLenderAndTitleFees}
                      format="currency"
                      onSave={(v) => handleHardMoneyChange('hardLenderAndTitleFees', v as number)}
                      size="sm"
                    />
                    <EditableField
                      label="Months to Refi"
                      value={hardMoneyInputs.hardMonthsToRefinance}
                      format="number"
                      onSave={(v) => handleHardMoneyChange('hardMonthsToRefinance', v as number)}
                      size="sm"
                    />
                    <EditableField
                      label="Weeks Until Leased"
                      value={hardMoneyInputs.hardWeeksUntilLeased}
                      format="number"
                      onSave={(v) => handleHardMoneyChange('hardWeeksUntilLeased', v as number)}
                      size="sm"
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
                    <EditableField
                      label="Refi LTV %"
                      value={hardMoneyInputs.refinanceLoanToValuePercent}
                      format="percent"
                      onSave={(v) => handleHardMoneyChange('refinanceLoanToValuePercent', v as number)}
                      size="sm"
                    />
                    <EditableField
                      label="Refi Term (Years)"
                      value={hardMoneyInputs.refinanceLoanTermInYears}
                      format="number"
                      onSave={(v) => handleHardMoneyChange('refinanceLoanTermInYears', v as number)}
                      size="sm"
                    />
                    <EditableField
                      label="Refi Interest Rate %"
                      value={hardMoneyInputs.refinanceInterestRatePercent}
                      format="percent"
                      step={0.125}
                      onSave={(v) => handleHardMoneyChange('refinanceInterestRatePercent', v as number)}
                      size="sm"
                    />
                    <EditableField
                      label="Refi Lender/Title Fees"
                      value={hardMoneyInputs.refinanceLenderAndTitleFees}
                      format="currency"
                      onSave={(v) => handleHardMoneyChange('refinanceLenderAndTitleFees', v as number)}
                      size="sm"
                    />
                    <EditableField
                      label="Months Tax/Ins Escrow"
                      value={hardMoneyInputs.refinanceMonthsTaxAndInsurance}
                      format="number"
                      onSave={(v) => handleHardMoneyChange('refinanceMonthsTaxAndInsurance', v as number)}
                      size="sm"
                    />
                    <EditableField
                      label="Mortgage Ins (Annual)"
                      value={hardMoneyInputs.refinanceMortgageInsuranceAnnual}
                      format="currency"
                      onSave={(v) => handleHardMoneyChange('refinanceMortgageInsuranceAnnual', v as number)}
                      size="sm"
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
                    <ResultField label="Cash-on-Cash Return" value={formatPercent(calculator.hardCashOnCashReturnPercent, 1)} highlight />
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

// Result field component (read-only calculated values)
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
