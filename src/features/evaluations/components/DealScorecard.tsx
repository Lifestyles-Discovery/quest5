import { formatCurrency, formatPercent } from '@/utils/formatters';
import type { Calculator } from '@app-types/evaluation.types';

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
            <ScoreColumn
              cashflow={calculator.conventionalTotalCashflowMonthly}
              returnPercent={calculator.conventionalCashOnCashReturnPercent}
              cashNeeded={calculator.conventionalCashToClose}
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
              Hard Money / BRRRR
            </h3>
            <ToggleButton
              checked={showHardMoney}
              onChange={onToggleHardMoney}
            />
          </div>

          {showHardMoney ? (
            <ScoreColumn
              cashflow={calculator.hardRefiTotalCashflowMonthly}
              returnPercent={calculator.hardCashOnCashReturnPercent}
              cashNeeded={calculator.hardCashOutOfPocketTotal}
            />
          ) : (
            <div className="h-32 flex items-center justify-center">
              <span className="text-sm text-gray-400 dark:text-gray-500">Disabled</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ScoreColumnProps {
  cashflow: number;
  returnPercent: number;
  cashNeeded: number;
}

function ScoreColumn({ cashflow, returnPercent, cashNeeded }: ScoreColumnProps) {
  const isPositiveCashflow = cashflow >= 0;
  const isGoodReturn = returnPercent >= 8; // 8% is generally considered good

  return (
    <div className="space-y-4">
      {/* Monthly Cashflow - Hero metric */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Cashflow</p>
        <p
          className={`text-3xl font-bold ${
            isPositiveCashflow
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {formatCurrency(cashflow)}
          <span className="text-lg font-normal text-gray-400">/mo</span>
        </p>
      </div>

      {/* Cash-on-Cash Return */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Cash-on-Cash Return</p>
        <p
          className={`text-2xl font-semibold ${
            isGoodReturn
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-900 dark:text-white'
          }`}
        >
          {formatPercent(returnPercent, 1)}
        </p>
      </div>

      {/* Cash Needed */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Cash Needed</p>
        <p className="text-lg font-medium text-gray-900 dark:text-white">
          {formatCurrency(cashNeeded)}
        </p>
      </div>
    </div>
  );
}

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
