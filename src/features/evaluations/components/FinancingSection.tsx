import { EditableField } from '@/components/form/EditableField';
import { ChevronDownIcon, InfoIcon } from '@/icons';
import Checkbox from '@/components/form/input/Checkbox';
import { FieldHelp, useHelpSection } from '@/features/guidance';
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
  isExpanded: boolean;
  onToggle: () => void;
}

export default function FinancingSection({
  type,
  calculator,
  onConventionalChange,
  onHardMoneyChange,
  isExpanded,
  onToggle,
}: FinancingSectionProps) {

  if (type === 'conventional') {
    return (
      <ConventionalSection
        calculator={calculator}
        onChange={onConventionalChange}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />
    );
  }

  return (
    <HardMoneySection
      calculator={calculator}
      onChange={onHardMoneyChange}
      isExpanded={isExpanded}
      onToggle={onToggle}
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
  const [helpEnabled, toggleHelp] = useHelpSection('conventional');

  if (!inputs.show) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="flex w-full items-center justify-between p-4">
        <button
          onClick={onToggle}
          className="flex flex-1 items-center gap-3 text-left hover:opacity-80"
        >
          <ChevronDownIcon
            className={`size-5 text-gray-400 transition-transform ${
              isExpanded ? '' : '-rotate-90'
            }`}
          />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Conventional Loan
          </h3>
        </button>

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

        {/* Help toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleHelp();
          }}
          className={`ml-4 flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
            helpEnabled
              ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
              : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
          }`}
          title={helpEnabled ? 'Hide help' : 'Show help'}
        >
          <InfoIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Expanded content - always rendered for PDF export, hidden when collapsed */}
      <div
        className={`border-t border-gray-200 p-6 dark:border-gray-700 ${isExpanded ? '' : 'hidden'}`}
        data-expandable-content="true"
      >
        <div className="space-y-6">
          {/* Loan Terms */}
          <div>
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Loan Terms
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <EditableField
                  label="Down Payment"
                  value={inputs.downPaymentPercent}
                  format="percent"
                  onSave={(v) => onChange('downPaymentPercent', v as number)}
                  size="sm"
                />
                <FieldHelp helpKey="conventionalDownPaymentPercent" show={helpEnabled} />
              </div>
              <div>
                <EditableField
                  label="Interest Rate"
                  value={inputs.interestRatePercent}
                  format="percent"
                  step={0.125}
                  onSave={(v) => onChange('interestRatePercent', v as number)}
                  size="sm"
                />
                <FieldHelp helpKey="conventionalInterestRate" show={helpEnabled} />
              </div>
              <EditableField
                label="Loan Term"
                value={inputs.loanTermInYears}
                format="number"
                suffix=" years"
                onSave={(v) => onChange('loanTermInYears', v as number)}
                size="sm"
              />
              <div>
                <EditableField
                  label="Lender Fees"
                  value={inputs.lenderAndTitleFees}
                  format="currency"
                  onSave={(v) => onChange('lenderAndTitleFees', v as number)}
                  size="sm"
                />
                <FieldHelp helpKey="conventionalLenderAndTitleFees" show={helpEnabled} />
              </div>
              <div>
                <EditableField
                  label="Escrow Months"
                  value={inputs.monthsTaxAndInsurance}
                  format="number"
                  onSave={(v) => onChange('monthsTaxAndInsurance', v as number)}
                  size="sm"
                />
                <FieldHelp helpKey="conventionalMonthsTaxEscrow" show={helpEnabled} />
              </div>
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
        </div>
      </div>
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
  const [helpEnabled, toggleHelp] = useHelpSection('hard-money');

  if (!inputs.show) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="flex w-full items-center justify-between p-4">
        <button
          onClick={onToggle}
          className="flex flex-1 items-center gap-3 text-left hover:opacity-80"
        >
          <ChevronDownIcon
            className={`size-5 text-gray-400 transition-transform ${
              isExpanded ? '' : '-rotate-90'
            }`}
          />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Hard Money + Refinance
          </h3>
        </button>

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

        {/* Help toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleHelp();
          }}
          className={`ml-4 flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
            helpEnabled
              ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
              : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
          }`}
          title={helpEnabled ? 'Hide help' : 'Show help'}
        >
          <InfoIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Expanded content - always rendered for PDF export, hidden when collapsed */}
      <div
        className={`border-t border-gray-200 p-6 dark:border-gray-700 ${isExpanded ? '' : 'hidden'}`}
        data-expandable-content="true"
      >
        <div className="space-y-6">
          {/* Hard Money Loan */}
          <div>
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Hard Money Loan
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <EditableField
                  label="Loan-to-Value"
                  value={inputs.hardLoanToValuePercent}
                  format="percent"
                  onSave={(v) => onChange('hardLoanToValuePercent', v as number)}
                  size="sm"
                />
                <FieldHelp helpKey="hardLoanToValuePercent" show={helpEnabled} />
              </div>
              <div>
                <EditableField
                  label="Interest Rate"
                  value={inputs.hardInterestRate}
                  format="percent"
                  onSave={(v) => onChange('hardInterestRate', v as number)}
                  size="sm"
                />
                <FieldHelp helpKey="hardInterestRate" show={helpEnabled} />
              </div>
              <div>
                <EditableField
                  label="Lender Fees"
                  value={inputs.hardLenderAndTitleFees}
                  format="currency"
                  onSave={(v) => onChange('hardLenderAndTitleFees', v as number)}
                  size="sm"
                />
                <FieldHelp helpKey="hardLenderAndTitleFees" show={helpEnabled} />
              </div>
              <div>
                <EditableField
                  label="Months to Refi"
                  value={inputs.hardMonthsToRefinance}
                  format="number"
                  onSave={(v) => onChange('hardMonthsToRefinance', v as number)}
                  size="sm"
                />
                <FieldHelp helpKey="hardMonthsToRefi" show={helpEnabled} />
              </div>
              <div>
                <EditableField
                  label="Weeks to Lease"
                  value={inputs.hardWeeksUntilLeased}
                  format="number"
                  onSave={(v) => onChange('hardWeeksUntilLeased', v as number)}
                  size="sm"
                />
                <FieldHelp helpKey="hardWeeksUntilLeased" show={helpEnabled} />
              </div>
              <div className="pt-5">
                {/* Interactive checkbox - hidden in PDF */}
                <Checkbox
                  label="Roll in Lender Fees"
                  checked={inputs.hardRollInLenderFees}
                  onChange={(checked) => onChange('hardRollInLenderFees', checked)}
                />
                <FieldHelp helpKey="hardRollInLenderFees" show={helpEnabled} />
                {/* Print-only text showing checkbox state */}
                <div className="hidden text-sm" data-print-content="true">
                  <span className="text-gray-500">Roll in Lender Fees:</span>{' '}
                  <span className="font-medium text-gray-900">
                    {inputs.hardRollInLenderFees ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Refinance Loan */}
          <div>
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Refinance Loan
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <EditableField
                  label="Loan-to-Value"
                  value={inputs.refinanceLoanToValuePercent}
                  format="percent"
                  onSave={(v) => onChange('refinanceLoanToValuePercent', v as number)}
                  size="sm"
                />
                <FieldHelp helpKey="refiLoanToValuePercent" show={helpEnabled} />
              </div>
              <div>
                <EditableField
                  label="Interest Rate"
                  value={inputs.refinanceInterestRatePercent}
                  format="percent"
                  step={0.125}
                  onSave={(v) => onChange('refinanceInterestRatePercent', v as number)}
                  size="sm"
                />
                <FieldHelp helpKey="refiInterestRate" show={helpEnabled} />
              </div>
              <EditableField
                label="Loan Term"
                value={inputs.refinanceLoanTermInYears}
                format="number"
                suffix=" years"
                onSave={(v) => onChange('refinanceLoanTermInYears', v as number)}
                size="sm"
              />
              <div>
                <EditableField
                  label="Lender Fees"
                  value={inputs.refinanceLenderAndTitleFees}
                  format="currency"
                  onSave={(v) => onChange('refinanceLenderAndTitleFees', v as number)}
                  size="sm"
                />
                <FieldHelp helpKey="refiLenderAndTitleFees" show={helpEnabled} />
              </div>
              <div>
                <EditableField
                  label="Escrow Months"
                  value={inputs.refinanceMonthsTaxAndInsurance}
                  format="number"
                  onSave={(v) => onChange('refinanceMonthsTaxAndInsurance', v as number)}
                  size="sm"
                />
                <FieldHelp helpKey="refiMonthsTaxEscrow" show={helpEnabled} />
              </div>
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
        </div>
      </div>
    </div>
  );
}
