import { useState } from 'react';
import { EditableField } from '@/components/form/EditableField';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { ChevronDownIcon } from '@/icons';
import Checkbox from '@/components/form/input/Checkbox';
import type {
  Calculator,
  ConventionalInputs,
  HardMoneyInputs,
} from '@app-types/evaluation.types';

type FinancingType = 'conventional' | 'hardmoney';

interface FinancingSectionProps {
  type: FinancingType;
  calculator: Calculator;
  onConventionalChange: (field: keyof ConventionalInputs, value: number | boolean) => void;
  onHardMoneyChange: (field: keyof HardMoneyInputs, value: number | boolean) => void;
  defaultExpanded?: boolean;
}

export default function FinancingSection({
  type,
  calculator,
  onConventionalChange,
  onHardMoneyChange,
  defaultExpanded = false,
}: FinancingSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (type === 'conventional') {
    return (
      <ConventionalSection
        calculator={calculator}
        onChange={onConventionalChange}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
      />
    );
  }

  return (
    <HardMoneySection
      calculator={calculator}
      onChange={onHardMoneyChange}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
    />
  );
}

// ============================================================================
// Conventional Section
// ============================================================================

interface ConventionalSectionProps {
  calculator: Calculator;
  onChange: (field: keyof ConventionalInputs, value: number | boolean) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

function ConventionalSection({
  calculator,
  onChange,
  isExpanded,
  onToggle,
}: ConventionalSectionProps) {
  const inputs = calculator.conventionalInputs;

  if (!inputs.show) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
      >
        <div className="flex items-center gap-3">
          <ChevronDownIcon
            className={`size-5 text-gray-400 transition-transform ${
              isExpanded ? '' : '-rotate-90'
            }`}
          />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Conventional Loan
          </h3>
        </div>

        {/* Inline summary when collapsed */}
        {!isExpanded && (
          <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-300">
            <span>
              <span className="text-gray-400">Down:</span> {inputs.downPaymentPercent}%
            </span>
            <span className="hidden sm:inline">
              <span className="text-gray-400">Rate:</span> {inputs.interestRatePercent}%
            </span>
            <span className="hidden md:inline">
              <span className="text-gray-400">Term:</span> {inputs.loanTermInYears} yrs
            </span>
          </div>
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6 dark:border-gray-700">
          <div className="space-y-6">
            {/* Loan Terms */}
            <div>
              <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Loan Terms
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <EditableField
                  label="Down Payment"
                  value={inputs.downPaymentPercent}
                  format="percent"
                  onSave={(v) => onChange('downPaymentPercent', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Interest Rate"
                  value={inputs.interestRatePercent}
                  format="percent"
                  step={0.125}
                  onSave={(v) => onChange('interestRatePercent', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Loan Term"
                  value={inputs.loanTermInYears}
                  format="number"
                  suffix=" years"
                  onSave={(v) => onChange('loanTermInYears', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Lender Fees"
                  value={inputs.lenderAndTitleFees}
                  format="currency"
                  onSave={(v) => onChange('lenderAndTitleFees', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Escrow Months"
                  value={inputs.monthsTaxAndInsurance}
                  format="number"
                  onSave={(v) => onChange('monthsTaxAndInsurance', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Mortgage Insurance"
                  value={inputs.mortgageInsuranceAnnual}
                  format="currency"
                  suffix="/yr"
                  onSave={(v) => onChange('mortgageInsuranceAnnual', v as number)}
                  size="sm"
                />
              </div>
            </div>

            {/* Results */}
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
              <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Results
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <ResultField
                  label="Loan Amount"
                  value={formatCurrency(calculator.conventionalLoanAmount)}
                />
                <ResultField
                  label="Cash Needed"
                  value={formatCurrency(calculator.conventionalCashToClose)}
                />
                <ResultField
                  label="Monthly Payment"
                  value={formatCurrency(calculator.conventionalNotePaymentMonthly)}
                />
                <ResultField
                  label="Monthly Cashflow"
                  value={formatCurrency(calculator.conventionalTotalCashflowMonthly)}
                  highlight={calculator.conventionalTotalCashflowMonthly >= 0}
                />
                <ResultField
                  label="Annual Cashflow"
                  value={formatCurrency(calculator.conventionalAnnualCashFlow)}
                />
                <ResultField
                  label="Cash-on-Cash Return"
                  value={formatPercent(calculator.conventionalCashOnCashReturnPercent, 1)}
                  highlight={calculator.conventionalCashOnCashReturnPercent >= 8}
                />
                <ResultField
                  label="Unrealized Gain"
                  value={formatCurrency(calculator.conventionalUnrealizedCapitalGain)}
                />
                <ResultField
                  label="Return on Gain"
                  value={formatPercent(calculator.conventionalReturnOnCapitalGainPercent, 1)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Hard Money Section
// ============================================================================

interface HardMoneySectionProps {
  calculator: Calculator;
  onChange: (field: keyof HardMoneyInputs, value: number | boolean) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

function HardMoneySection({
  calculator,
  onChange,
  isExpanded,
  onToggle,
}: HardMoneySectionProps) {
  const inputs = calculator.hardMoneyInputs;

  if (!inputs.show) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
      >
        <div className="flex items-center gap-3">
          <ChevronDownIcon
            className={`size-5 text-gray-400 transition-transform ${
              isExpanded ? '' : '-rotate-90'
            }`}
          />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Hard Money + Refinance
          </h3>
        </div>

        {/* Inline summary when collapsed */}
        {!isExpanded && (
          <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-300">
            <span>
              <span className="text-gray-400">LTV:</span> {inputs.hardLoanToValuePercent}%
            </span>
            <span className="hidden sm:inline">
              <span className="text-gray-400">Rate:</span> {inputs.hardInterestRate}%
            </span>
            <span className="hidden md:inline">
              <span className="text-gray-400">Refi:</span> {inputs.hardMonthsToRefinance} mo
            </span>
          </div>
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6 dark:border-gray-700">
          <div className="space-y-6">
            {/* Hard Money Loan */}
            <div>
              <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Hard Money Loan
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <EditableField
                  label="Loan-to-Value"
                  value={inputs.hardLoanToValuePercent}
                  format="percent"
                  onSave={(v) => onChange('hardLoanToValuePercent', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Interest Rate"
                  value={inputs.hardInterestRate}
                  format="percent"
                  onSave={(v) => onChange('hardInterestRate', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Lender Fees"
                  value={inputs.hardLenderAndTitleFees}
                  format="currency"
                  onSave={(v) => onChange('hardLenderAndTitleFees', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Months to Refi"
                  value={inputs.hardMonthsToRefinance}
                  format="number"
                  onSave={(v) => onChange('hardMonthsToRefinance', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Weeks to Lease"
                  value={inputs.hardWeeksUntilLeased}
                  format="number"
                  onSave={(v) => onChange('hardWeeksUntilLeased', v as number)}
                  size="sm"
                />
                <div className="pt-5">
                  <Checkbox
                    label="Roll in Lender Fees"
                    checked={inputs.hardRollInLenderFees}
                    onChange={(checked) => onChange('hardRollInLenderFees', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Refinance Loan */}
            <div>
              <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Refinance Loan
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <EditableField
                  label="Loan-to-Value"
                  value={inputs.refinanceLoanToValuePercent}
                  format="percent"
                  onSave={(v) => onChange('refinanceLoanToValuePercent', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Interest Rate"
                  value={inputs.refinanceInterestRatePercent}
                  format="percent"
                  step={0.125}
                  onSave={(v) => onChange('refinanceInterestRatePercent', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Loan Term"
                  value={inputs.refinanceLoanTermInYears}
                  format="number"
                  suffix=" years"
                  onSave={(v) => onChange('refinanceLoanTermInYears', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Lender Fees"
                  value={inputs.refinanceLenderAndTitleFees}
                  format="currency"
                  onSave={(v) => onChange('refinanceLenderAndTitleFees', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Escrow Months"
                  value={inputs.refinanceMonthsTaxAndInsurance}
                  format="number"
                  onSave={(v) => onChange('refinanceMonthsTaxAndInsurance', v as number)}
                  size="sm"
                />
                <EditableField
                  label="Mortgage Insurance"
                  value={inputs.refinanceMortgageInsuranceAnnual}
                  format="currency"
                  suffix="/yr"
                  onSave={(v) => onChange('refinanceMortgageInsuranceAnnual', v as number)}
                  size="sm"
                />
              </div>
            </div>

            {/* Results */}
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
              <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Results
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <ResultField
                  label="Hard Money Loan"
                  value={formatCurrency(calculator.hardLoanAmount)}
                />
                <ResultField
                  label="Cash to Close"
                  value={formatCurrency(calculator.hardCashToClose)}
                />
                <ResultField
                  label="Holding Cost"
                  value={formatCurrency(calculator.hardHoldingCost)}
                />
                <ResultField
                  label="Refi Loan Amount"
                  value={formatCurrency(calculator.hardRefiLoanAmount)}
                />
                <ResultField
                  label="Refi Cash to Close"
                  value={formatCurrency(calculator.hardRefiCashToClose)}
                />
                <ResultField
                  label="Cash Back at Refi"
                  value={formatCurrency(calculator.hardRefiCashBack)}
                  highlight={calculator.hardRefiCashBack > 0}
                />
                <ResultField
                  label="Total Out of Pocket"
                  value={formatCurrency(calculator.hardCashOutOfPocketTotal)}
                />
                <ResultField
                  label="Monthly Payment"
                  value={formatCurrency(calculator.hardRefiNotePaymentMonthly)}
                />
                <ResultField
                  label="Monthly Cashflow"
                  value={formatCurrency(calculator.hardRefiTotalCashflowMonthly)}
                  highlight={calculator.hardRefiTotalCashflowMonthly >= 0}
                />
                <ResultField
                  label="Annual Cashflow"
                  value={formatCurrency(calculator.hardAnnualCashFlow)}
                />
                <ResultField
                  label="Cash-on-Cash Return"
                  value={formatPercent(calculator.hardCashOnCashReturnPercent, 1)}
                  highlight={calculator.hardCashOnCashReturnPercent >= 8}
                />
                <ResultField
                  label="Unrealized Gain"
                  value={formatCurrency(calculator.hardUnrealizedCapitalGain)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Shared Components
// ============================================================================

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
