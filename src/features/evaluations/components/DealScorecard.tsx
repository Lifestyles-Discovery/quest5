import { useState } from 'react';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { useReadOnly } from '@/context/ReadOnlyContext';
import type { Calculator } from '@app-types/evaluation.types';
import CalculationBreakdownModal from './CalculationBreakdownModal';

interface DealScorecardProps {
  calculator: Calculator;
  onToggleConventional: (show: boolean) => void;
  onToggleHardMoney: (show: boolean) => void;
}

export default function DealScorecard({
  calculator,
  onToggleConventional,
  onToggleHardMoney,
}: DealScorecardProps) {
  const { isReadOnly } = useReadOnly();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { conventionalInputs, hardMoneyInputs } = calculator;

  const showConventional = conventionalInputs.show;
  const showHardMoney = hardMoneyInputs.show;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Primary Metrics - Gains & Returns */}
      <div className="grid grid-cols-1 divide-y divide-gray-200 dark:divide-gray-700 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        {/* Conventional Column */}
        <div className={`p-6 ${!showConventional ? 'opacity-40' : ''}`}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Conventional
            </h3>
            {!isReadOnly && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 dark:text-gray-500">Show</span>
                <ToggleButton
                  checked={showConventional}
                  onChange={onToggleConventional}
                />
              </div>
            )}
          </div>

          {showConventional ? (
            <GainsColumn
              equityCapture={calculator.conventionalUnrealizedCapitalGain}
              cashOnCashReturn={calculator.conventionalCashOnCashReturnPercent}
              annualCashflow={calculator.conventionalAnnualCashFlow}
              returnOnEquity={calculator.conventionalReturnOnCapitalGainPercent}
            />
          ) : (
            <div className="h-32 flex items-center justify-center">
              <span className="text-sm text-gray-400 dark:text-gray-500">Disabled</span>
            </div>
          )}
        </div>

        {/* Hard Money Column */}
        <div className={`p-6 ${!showHardMoney ? 'opacity-40' : ''}`}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Hard Money + Refi
            </h3>
            {!isReadOnly && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 dark:text-gray-500">Show</span>
                <ToggleButton
                  checked={showHardMoney}
                  onChange={onToggleHardMoney}
                />
              </div>
            )}
          </div>

          {showHardMoney ? (
            <GainsColumn
              equityCapture={calculator.hardUnrealizedCapitalGain}
              cashOnCashReturn={calculator.hardCashOnCashReturnPercent}
              annualCashflow={calculator.hardAnnualCashFlow}
              returnOnEquity={calculator.hardReturnOnCapitalGainPercent}
            />
          ) : (
            <div className="h-32 flex items-center justify-center">
              <span className="text-sm text-gray-400 dark:text-gray-500">Disabled</span>
            </div>
          )}
        </div>
      </div>

      {/* Details Section */}
      {(showConventional || showHardMoney) && (
        <>
          {/* Cash Out Of Pocket & Monthly Cash Flow Details */}
          <div className="grid grid-cols-1 divide-y divide-gray-200 border-t border-gray-200 bg-gray-50 dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-900/50 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {/* Conventional Details */}
            <div className={`p-6 ${!showConventional ? 'opacity-40' : ''}`}>
              {showConventional ? (
                <ConventionalDetailsColumn
                  downPayment={calculator.conventionalDownpayment}
                  closingCosts={calculator.conventionalClosingCosts}
                  prepaidExpenses={calculator.conventionalPrepaidExpenses}
                  repairs={calculator.conventionalRepairsMakeReady}
                  cashNeeded={calculator.conventionalCashOutOfPocketTotal}
                  monthlyRent={calculator.conventionalMonthlyRent}
                  notePayment={calculator.conventionalNotePaymentMonthly}
                  propertyTax={calculator.conventionalPropertyTaxMonthly}
                  propertyInsurance={calculator.conventionalPropertyInsuranceMonthly}
                  mortgageInsurance={calculator.conventionalMortgageInsuranceMonthly}
                  hoa={calculator.conventionalHoaMonthly}
                  miscellaneous={calculator.conventionalMiscellaneousMonthly}
                  monthlyCashflow={calculator.conventionalTotalCashflowMonthly}
                />
              ) : (
                <div className="h-20 flex items-center justify-center">
                  <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                </div>
              )}
            </div>

            {/* Hard Money Details */}
            <div className={`p-6 ${!showHardMoney ? 'opacity-40' : ''}`}>
              {showHardMoney ? (
                <HardMoneyDetailsColumn
                  hardCashToClose={calculator.hardCashToClose}
                  hardHoldingCost={calculator.hardHoldingCost}
                  refiCashToClose={calculator.hardRefiCashToClose}
                  refiCashBack={calculator.hardRefiCashBack}
                  cashNeeded={calculator.hardCashOutOfPocketTotal}
                  monthlyRent={calculator.hardMonthlyRent}
                  notePayment={calculator.hardRefinanceNotePaymentMonthly}
                  propertyTax={calculator.hardPropertyTaxMonthly}
                  propertyInsurance={calculator.hardPropertyInsuranceMonthly}
                  mortgageInsurance={calculator.hardMortgageInsuranceMonthly}
                  hoa={calculator.hardHoaMonthly}
                  miscellaneous={calculator.hardMiscellaneousMonthly}
                  monthlyCashflow={calculator.hardTotalCashflowMonthly}
                />
              ) : (
                <div className="h-20 flex items-center justify-center">
                  <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                </div>
              )}
            </div>
          </div>

          {/* How are these calculated link */}
          <button
            onClick={() => setShowBreakdown(true)}
            className="flex w-full items-center justify-center border-t border-gray-200 py-3 text-sm text-gray-400 hover:text-gray-600 hover:underline dark:border-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
            data-hide-in-pdf="true"
          >
            How are these calculated?
          </button>
        </>
      )}

      {/* Calculation Breakdown Modal */}
      <CalculationBreakdownModal
        isOpen={showBreakdown}
        onClose={() => setShowBreakdown(false)}
        calculator={calculator}
      />
    </div>
  );
}

// ============================================================================
// Gains & Returns Column (Primary)
// ============================================================================

interface GainsColumnProps {
  equityCapture: number;
  cashOnCashReturn: number;
  annualCashflow: number;
  returnOnEquity: number;
}

function GainsColumn({ equityCapture, cashOnCashReturn, annualCashflow, returnOnEquity }: GainsColumnProps) {
  const isPositiveEquity = equityCapture > 0;
  const isGoodReturn = cashOnCashReturn >= 8;
  const isPositiveCashflow = annualCashflow >= 0;

  return (
    <div className="space-y-4">
      {/* Equity Capture */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Equity Capture</p>
        <p
          className={`text-lg font-semibold ${
            isPositiveEquity
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-900 dark:text-white'
          }`}
        >
          {formatCurrency(equityCapture)}
        </p>
      </div>

      {/* Annual Cashflow */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Annual Cashflow</p>
        <p
          className={`text-lg font-semibold ${
            isPositiveCashflow
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {formatCurrency(annualCashflow)}
          <span className="text-sm font-normal text-gray-400">/yr</span>
        </p>
      </div>

      {/* Return on Equity Capture */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Return on Equity</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          {formatPercent(returnOnEquity, 1)}
        </p>
      </div>

      {/* Cash-on-Cash Return */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Cash-on-Cash Return</p>
        <p
          className={`text-lg font-semibold ${
            isGoodReturn
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-900 dark:text-white'
          }`}
        >
          {formatPercent(cashOnCashReturn, 1)}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Conventional Details Column (Secondary - Expandable)
// ============================================================================

interface ConventionalDetailsProps {
  downPayment: number;
  closingCosts: number;
  prepaidExpenses: number;
  repairs: number;
  cashNeeded: number;
  monthlyRent: number;
  notePayment: number;
  propertyTax: number;
  propertyInsurance: number;
  mortgageInsurance: number;
  hoa: number;
  miscellaneous: number;
  monthlyCashflow: number;
}

function ConventionalDetailsColumn({
  downPayment,
  closingCosts,
  prepaidExpenses,
  repairs,
  cashNeeded,
  monthlyRent,
  notePayment,
  propertyTax,
  propertyInsurance,
  mortgageInsurance,
  hoa,
  miscellaneous,
  monthlyCashflow,
}: ConventionalDetailsProps) {
  const isPositiveCashflow = monthlyCashflow >= 0;

  return (
    <div className="space-y-6">
      {/* Cash Out Of Pocket Section */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Cash Out Of Pocket
        </h4>
        <div className="space-y-1">
          <DetailRow label="Down payment" value={downPayment} />
          <DetailRow label="Closing costs" value={closingCosts} />
          <DetailRow label="Prepaid expenses" value={prepaidExpenses} />
          <DetailRow label="Repairs" value={repairs} />
          <DetailRow label="Total" value={cashNeeded} isTotal />
        </div>
      </div>

      {/* Monthly Cash Flow Section */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Monthly Cash Flow
        </h4>
        <div className="space-y-1">
          <DetailRow label="Monthly rent" value={monthlyRent} isPositive />
          <DetailRow label="Note payment" value={-notePayment} />
          <DetailRow label="Property tax" value={-propertyTax} />
          <DetailRow label="Property ins" value={-propertyInsurance} />
          <DetailRow label="Mortgage ins" value={-mortgageInsurance} />
          <DetailRow label="HOA" value={-hoa} />
          <DetailRow label="Misc monthly" value={-miscellaneous} />
          <DetailRow
            label="Total"
            value={monthlyCashflow}
            isTotal
            colorCode={isPositiveCashflow ? 'positive' : 'negative'}
            suffix="/mo"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Hard Money Details Column (Secondary - Expandable)
// ============================================================================

interface HardMoneyDetailsProps {
  hardCashToClose: number;
  hardHoldingCost: number;
  refiCashToClose: number;
  refiCashBack: number;
  cashNeeded: number;
  monthlyRent: number;
  notePayment: number;
  propertyTax: number;
  propertyInsurance: number;
  mortgageInsurance: number;
  hoa: number;
  miscellaneous: number;
  monthlyCashflow: number;
}

function HardMoneyDetailsColumn({
  hardCashToClose,
  hardHoldingCost,
  refiCashToClose,
  refiCashBack,
  cashNeeded,
  monthlyRent,
  notePayment,
  propertyTax,
  propertyInsurance,
  mortgageInsurance,
  hoa,
  miscellaneous,
  monthlyCashflow,
}: HardMoneyDetailsProps) {
  const isPositiveCashflow = monthlyCashflow >= 0;

  return (
    <div className="space-y-6">
      {/* Cash Out Of Pocket Section */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Cash Out Of Pocket
        </h4>
        <div className="space-y-1">
          <DetailRow label="Hard cash to close" value={hardCashToClose} />
          <DetailRow label="Holding costs" value={hardHoldingCost} />
          <DetailRow label="Refi cash to close" value={refiCashToClose} />
          <DetailRow label="Refi cashback" value={-refiCashBack} note="*" />
          <DetailRow label="Total" value={cashNeeded} isTotal />
        </div>
      </div>

      {/* Monthly Cash Flow Section (Post-Refi) */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Monthly Cash Flow
        </h4>
        <div className="space-y-1">
          <DetailRow label="Monthly rent" value={monthlyRent} isPositive />
          <DetailRow label="Note payment" value={-notePayment} />
          <DetailRow label="Property tax" value={-propertyTax} />
          <DetailRow label="Property ins" value={-propertyInsurance} />
          <DetailRow label="Mortgage ins" value={-mortgageInsurance} />
          <DetailRow label="HOA" value={-hoa} />
          <DetailRow label="Misc monthly" value={-miscellaneous} />
          <DetailRow
            label="Total"
            value={monthlyCashflow}
            isTotal
            colorCode={isPositiveCashflow ? 'positive' : 'negative'}
            suffix="/mo"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Detail Row Helper
// ============================================================================

interface DetailRowProps {
  label: string;
  value: number;
  isTotal?: boolean;
  isPositive?: boolean;
  colorCode?: 'positive' | 'negative';
  suffix?: string;
  note?: string;
}

function DetailRow({ label, value, isTotal, isPositive, colorCode, suffix, note }: DetailRowProps) {
  let valueClass = 'text-gray-900 dark:text-white';
  if (isPositive) {
    valueClass = 'text-green-600 dark:text-green-400';
  } else if (colorCode === 'positive') {
    valueClass = 'text-green-600 dark:text-green-400';
  } else if (colorCode === 'negative') {
    valueClass = 'text-red-600 dark:text-red-400';
  }

  return (
    <div
      className={`flex items-center justify-between ${
        isTotal ? 'border-t border-gray-200 pt-1 dark:border-gray-600' : ''
      }`}
    >
      <p className={`text-sm text-gray-500 dark:text-gray-400 ${isTotal ? 'font-semibold' : ''}`}>
        {note && <span className="text-gray-400">{note}</span>}
        {label}
      </p>
      <p className={`text-sm ${isTotal ? 'font-semibold' : ''} ${valueClass}`}>
        {formatCurrency(value)}
        {suffix && <span className="text-gray-400">{suffix}</span>}
      </p>
    </div>
  );
}

// ============================================================================
// Toggle Button
// ============================================================================

interface ToggleButtonProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleButton({ label, checked, onChange }: ToggleButtonProps) {
  const toggle = (
    <button
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
        border-2 transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${checked
          ? 'bg-primary border-primary'
          : 'bg-gray-700 border-gray-800 shadow-md dark:bg-gray-500 dark:border-gray-400'}
      `}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full
          bg-white shadow ring-0 transition duration-200 ease-in-out
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  );

  if (label) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        {toggle}
      </div>
    );
  }

  return toggle;
}
