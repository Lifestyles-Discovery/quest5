import { useState } from 'react';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { ChevronDownIcon } from '@/icons';
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
  const [showDetails, setShowDetails] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { conventionalInputs, hardMoneyInputs } = calculator;

  const showConventional = conventionalInputs.show;
  const showHardMoney = hardMoneyInputs.show;

  // Neither strategy enabled
  if (!showConventional && !showHardMoney) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Enable a financing strategy to see results
        </p>
        <div className="mt-4 flex justify-center gap-4">
          <ToggleButton
            label="Conventional"
            checked={showConventional}
            onChange={onToggleConventional}
          />
          <ToggleButton
            label="Hard Money"
            checked={showHardMoney}
            onChange={onToggleHardMoney}
          />
        </div>
      </div>
    );
  }

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
            <ToggleButton
              checked={showConventional}
              onChange={onToggleConventional}
            />
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
            <ToggleButton
              checked={showHardMoney}
              onChange={onToggleHardMoney}
            />
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

      {/* Show Details Toggle */}
      {(showConventional || showHardMoney) && (
        <>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex w-full items-center justify-center gap-2 border-t border-gray-200 py-3 text-sm text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700/50"
          >
            <ChevronDownIcon
              className={`size-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
            />
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>

          {/* Expanded Details - always rendered for PDF export, hidden when collapsed */}
          <div
            className={`grid grid-cols-1 divide-y divide-gray-200 border-t border-gray-200 bg-gray-50 dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-900/50 sm:grid-cols-2 sm:divide-x sm:divide-y-0 ${showDetails ? '' : 'hidden'}`}
            data-expandable-content="true"
          >
            {/* Conventional Details */}
            <div className={`p-6 ${!showConventional ? 'opacity-40' : ''}`}>
              {showConventional ? (
                <DetailsColumn
                  cashNeeded={calculator.conventionalCashOutOfPocketTotal}
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
                <DetailsColumn
                  cashNeeded={calculator.hardCashOutOfPocketTotal}
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
// Details Column (Secondary - Expandable)
// ============================================================================

interface DetailsColumnProps {
  cashNeeded: number;
  monthlyCashflow: number;
}

function DetailsColumn({ cashNeeded, monthlyCashflow }: DetailsColumnProps) {
  const isPositiveCashflow = monthlyCashflow >= 0;

  return (
    <div className="space-y-3">
      {/* Cash Needed */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">Cash Needed</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {formatCurrency(cashNeeded)}
        </p>
      </div>

      {/* Monthly Cashflow */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Cashflow</p>
        <p
          className={`text-sm font-semibold ${
            isPositiveCashflow
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {formatCurrency(monthlyCashflow)}/mo
        </p>
      </div>
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
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
        border-2 border-transparent transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'}
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
}
