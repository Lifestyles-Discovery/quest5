import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import type { Calculator } from '@app-types/evaluation.types';

interface CalculationBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculator: Calculator;
}

type ViewMode = 'basic' | 'detailed';

export default function CalculationBreakdownModal({
  isOpen,
  onClose,
  calculator,
}: CalculationBreakdownModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('calculationBreakdownView') as ViewMode) || 'basic';
    }
    return 'basic';
  });

  useEffect(() => {
    localStorage.setItem('calculationBreakdownView', viewMode);
  }, [viewMode]);

  const { conventionalInputs, hardMoneyInputs } = calculator;
  const showConventional = conventionalInputs.show;
  const showHardMoney = hardMoneyInputs.show;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          How These Are Calculated
        </h2>
      </div>

      {/* View Toggle */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setViewMode('basic')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            viewMode === 'basic'
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Basic
        </button>
        <button
          onClick={() => setViewMode('detailed')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            viewMode === 'detailed'
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Detailed
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-2">
        {/* Conventional Section */}
        {showConventional && (
          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Conventional
            </h3>
            <div className="space-y-4">
              <ConventionalEquityCapture calculator={calculator} viewMode={viewMode} />
              <ConventionalMonthlyCashflow calculator={calculator} viewMode={viewMode} />
              <ConventionalAnnualCashflow calculator={calculator} viewMode={viewMode} />
              <ConventionalReturnOnEquity calculator={calculator} viewMode={viewMode} />
              <ConventionalCashOnCash calculator={calculator} viewMode={viewMode} />
              <ConventionalCashNeeded calculator={calculator} viewMode={viewMode} />
            </div>
          </section>
        )}

        {/* Hard Money Section */}
        {showHardMoney && (
          <section>
            {showConventional && (
              <div className="my-6 border-t border-gray-200 dark:border-gray-700" />
            )}
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Hard Money + Refi
            </h3>
            <div className="space-y-4">
              <HardMoneyEquityCapture calculator={calculator} viewMode={viewMode} />
              <HardMoneyMonthlyCashflow calculator={calculator} viewMode={viewMode} />
              <HardMoneyAnnualCashflow calculator={calculator} viewMode={viewMode} />
              <HardMoneyReturnOnEquity calculator={calculator} viewMode={viewMode} />
              <HardMoneyCashOnCash calculator={calculator} viewMode={viewMode} />
              <HardMoneyCashNeeded calculator={calculator} viewMode={viewMode} />
            </div>
          </section>
        )}
      </div>
    </Modal>
  );
}

// ============================================================================
// Shared Components
// ============================================================================

interface MetricCardProps {
  title: string;
  children: React.ReactNode;
}

function MetricCard({ title, children }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
      <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">{title}</h4>
      {children}
    </div>
  );
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-sm text-gray-700 dark:text-gray-300">{children}</p>
  );
}

function FormulaBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-1 font-mono text-sm text-gray-700 dark:text-gray-300">
      {children}
    </div>
  );
}

function FormulaLine({ children, isResult }: { children: React.ReactNode; isResult?: boolean }) {
  return (
    <div className={`${isResult ? 'mt-2 border-t border-gray-300 pt-2 font-semibold dark:border-gray-600' : ''}`}>
      {children}
    </div>
  );
}

function V({ label, value }: { label: string; value: string }) {
  return (
    <span>
      {label} (<span className="text-gray-900 dark:text-white">{value}</span>)
    </span>
  );
}

function SubHeader({ children }: { children: string }) {
  return (
    <p className="mb-1 mt-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 first:mt-0">
      {children}
    </p>
  );
}

// ============================================================================
// Conventional Metrics
// ============================================================================

interface MetricProps {
  calculator: Calculator;
  viewMode: ViewMode;
}

function ConventionalEquityCapture({ calculator, viewMode }: MetricProps) {
  const { dealTermInputs, conventionalInputs } = calculator;
  const result = calculator.conventionalUnrealizedCapitalGain;

  return (
    <MetricCard title="Equity Capture">
      {viewMode === 'basic' ? (
        <Formula>Market Value − Total Acquisition Cost = {formatCurrency(result)}</Formula>
      ) : (
        <FormulaBlock>
          <FormulaLine>
            <V label="Market Value" value={formatCurrency(dealTermInputs.estimatedMarketValue)} />
          </FormulaLine>
          <FormulaLine>
            − <V label="Purchase Price" value={formatCurrency(dealTermInputs.purchasePrice)} />
          </FormulaLine>
          <FormulaLine>
            − <V label="Survey" value={formatCurrency(dealTermInputs.survey)} />
          </FormulaLine>
          <FormulaLine>
            − <V label="Appraisal" value={formatCurrency(dealTermInputs.appraisal)} />
          </FormulaLine>
          <FormulaLine>
            − <V label="Repairs" value={formatCurrency(dealTermInputs.repairsMakeReady)} />
          </FormulaLine>
          <FormulaLine>
            − <V label="Lender & Title Fees" value={formatCurrency(conventionalInputs.lenderAndTitleFees)} />
          </FormulaLine>
          {dealTermInputs.sellerContribution > 0 && (
            <FormulaLine>
              + <V label="Seller Credit" value={formatCurrency(dealTermInputs.sellerContribution)} />
            </FormulaLine>
          )}
          <FormulaLine isResult>
            = <span className="text-gray-900 dark:text-white">{formatCurrency(result)}</span>
          </FormulaLine>
        </FormulaBlock>
      )}
    </MetricCard>
  );
}

function ConventionalMonthlyCashflow({ calculator, viewMode }: MetricProps) {
  const result = calculator.conventionalTotalCashflowMonthly;

  return (
    <MetricCard title="Monthly Cashflow">
      {viewMode === 'basic' ? (
        <Formula>Rent − Monthly Expenses = {formatCurrency(result)}/mo</Formula>
      ) : (
        <FormulaBlock>
          <FormulaLine>
            <V label="Monthly Rent" value={formatCurrency(calculator.conventionalMonthlyRent)} />
          </FormulaLine>
          <FormulaLine>
            − <V label="Mortgage Payment" value={formatCurrency(calculator.conventionalNotePaymentMonthly)} />
          </FormulaLine>
          <FormulaLine>
            − <V label="Property Tax" value={formatCurrency(calculator.conventionalPropertyTaxMonthly)} />/mo
          </FormulaLine>
          <FormulaLine>
            − <V label="Insurance" value={formatCurrency(calculator.conventionalPropertyInsuranceMonthly)} />/mo
          </FormulaLine>
          {calculator.conventionalMortgageInsuranceMonthly > 0 && (
            <FormulaLine>
              − <V label="Mortgage Insurance" value={formatCurrency(calculator.conventionalMortgageInsuranceMonthly)} />/mo
            </FormulaLine>
          )}
          {calculator.conventionalHoaMonthly > 0 && (
            <FormulaLine>
              − <V label="HOA" value={formatCurrency(calculator.conventionalHoaMonthly)} />/mo
            </FormulaLine>
          )}
          {calculator.conventionalMiscellaneousMonthly > 0 && (
            <FormulaLine>
              − <V label="Miscellaneous" value={formatCurrency(calculator.conventionalMiscellaneousMonthly)} />/mo
            </FormulaLine>
          )}
          <FormulaLine isResult>
            = <span className="text-gray-900 dark:text-white">{formatCurrency(result)}/mo</span>
          </FormulaLine>
        </FormulaBlock>
      )}
    </MetricCard>
  );
}

function ConventionalAnnualCashflow({ calculator, viewMode }: MetricProps) {
  const monthly = calculator.conventionalTotalCashflowMonthly;
  const result = calculator.conventionalAnnualCashFlow;

  return (
    <MetricCard title="Annual Cashflow">
      {viewMode === 'basic' ? (
        <Formula>Monthly Cashflow × 12 = {formatCurrency(result)}/yr</Formula>
      ) : (
        <FormulaBlock>
          <FormulaLine>
            <V label="Monthly Cashflow" value={formatCurrency(monthly)} /> × 12
          </FormulaLine>
          <FormulaLine isResult>
            = <span className="text-gray-900 dark:text-white">{formatCurrency(result)}/yr</span>
          </FormulaLine>
        </FormulaBlock>
      )}
    </MetricCard>
  );
}

function ConventionalReturnOnEquity({ calculator, viewMode }: MetricProps) {
  const equity = calculator.conventionalUnrealizedCapitalGain;
  const cash = calculator.conventionalCashOutOfPocketTotal;
  const result = calculator.conventionalReturnOnCapitalGainPercent;

  return (
    <MetricCard title="Return on Equity">
      {viewMode === 'basic' ? (
        <Formula>Equity Capture ÷ Cash Invested × 100 = {formatPercent(result, 1)}</Formula>
      ) : (
        <FormulaBlock>
          <FormulaLine>
            <V label="Equity Capture" value={formatCurrency(equity)} /> ÷ <V label="Cash Invested" value={formatCurrency(cash)} /> × 100
          </FormulaLine>
          <FormulaLine isResult>
            = <span className="text-gray-900 dark:text-white">{formatPercent(result, 1)}</span>
          </FormulaLine>
        </FormulaBlock>
      )}
    </MetricCard>
  );
}

function ConventionalCashOnCash({ calculator, viewMode }: MetricProps) {
  const annual = calculator.conventionalAnnualCashFlow;
  const cash = calculator.conventionalCashOutOfPocketTotal;
  const result = calculator.conventionalCashOnCashReturnPercent;

  return (
    <MetricCard title="Cash-on-Cash Return">
      {viewMode === 'basic' ? (
        <Formula>Annual Cashflow ÷ Cash Invested × 100 = {formatPercent(result, 1)}</Formula>
      ) : (
        <FormulaBlock>
          <FormulaLine>
            <V label="Annual Cashflow" value={formatCurrency(annual)} /> ÷ <V label="Cash Invested" value={formatCurrency(cash)} /> × 100
          </FormulaLine>
          <FormulaLine isResult>
            = <span className="text-gray-900 dark:text-white">{formatPercent(result, 1)}</span>
          </FormulaLine>
        </FormulaBlock>
      )}
    </MetricCard>
  );
}

function ConventionalCashNeeded({ calculator, viewMode }: MetricProps) {
  const { dealTermInputs, conventionalInputs } = calculator;
  const downPayment = calculator.conventionalDownpayment;
  const closingCosts = calculator.conventionalClosingCosts;
  const prepaid = calculator.conventionalPrepaidExpenses;
  const repairs = calculator.conventionalRepairsMakeReady;
  const result = calculator.conventionalCashOutOfPocketTotal;

  return (
    <MetricCard title="Cash Needed">
      {viewMode === 'basic' ? (
        <Formula>Down Payment + Closing Costs + Prepaid + Repairs = {formatCurrency(result)}</Formula>
      ) : (
        <FormulaBlock>
          <SubHeader>Down Payment</SubHeader>
          <FormulaLine>
            <V label="Purchase Price" value={formatCurrency(dealTermInputs.purchasePrice)} /> × <V label="Down %" value={`${conventionalInputs.downPaymentPercent}%`} /> = {formatCurrency(downPayment)}
          </FormulaLine>

          <SubHeader>Closing Costs</SubHeader>
          <FormulaLine>
            <V label="Survey" value={formatCurrency(dealTermInputs.survey)} /> + <V label="Appraisal" value={formatCurrency(dealTermInputs.appraisal)} /> + <V label="Inspection" value={formatCurrency(dealTermInputs.inspection)} /> + <V label="Lender Fees" value={formatCurrency(conventionalInputs.lenderAndTitleFees)} />
            {dealTermInputs.sellerContribution > 0 && (
              <> − <V label="Seller Credit" value={formatCurrency(dealTermInputs.sellerContribution)} /></>
            )}
            {' '}= {formatCurrency(closingCosts)}
          </FormulaLine>

          <SubHeader>Prepaid Expenses</SubHeader>
          <FormulaLine>
            (<V label="Tax" value={formatCurrency(dealTermInputs.propertyTaxAnnual)} /> + <V label="Insurance" value={formatCurrency(dealTermInputs.propertyInsuranceAnnual)} /> + <V label="MI" value={formatCurrency(conventionalInputs.mortgageInsuranceAnnual)} />) ÷ 12 × <V label="Escrow Months" value={String(conventionalInputs.monthsTaxAndInsurance)} /> + <V label="Annual Insurance" value={formatCurrency(dealTermInputs.propertyInsuranceAnnual)} /> = {formatCurrency(prepaid)}
          </FormulaLine>

          <SubHeader>Total</SubHeader>
          <FormulaLine>
            <V label="Down Payment" value={formatCurrency(downPayment)} /> + <V label="Closing" value={formatCurrency(closingCosts)} /> + <V label="Prepaid" value={formatCurrency(prepaid)} /> + <V label="Repairs" value={formatCurrency(repairs)} />
          </FormulaLine>
          <FormulaLine isResult>
            = <span className="text-gray-900 dark:text-white">{formatCurrency(result)}</span>
          </FormulaLine>
        </FormulaBlock>
      )}
    </MetricCard>
  );
}

// ============================================================================
// Hard Money Metrics
// ============================================================================

function HardMoneyEquityCapture({ calculator, viewMode }: MetricProps) {
  const { dealTermInputs, hardMoneyInputs } = calculator;
  const result = calculator.hardUnrealizedCapitalGain;

  return (
    <MetricCard title="Equity Capture">
      {viewMode === 'basic' ? (
        <Formula>Market Value − Total Acquisition Cost (including refi) = {formatCurrency(result)}</Formula>
      ) : (
        <FormulaBlock>
          <FormulaLine>
            <V label="Market Value" value={formatCurrency(dealTermInputs.estimatedMarketValue)} />
          </FormulaLine>
          <FormulaLine>
            − <V label="Purchase Price" value={formatCurrency(dealTermInputs.purchasePrice)} />
          </FormulaLine>
          <FormulaLine>
            − <V label="Repairs" value={formatCurrency(dealTermInputs.repairsMakeReady)} />
          </FormulaLine>
          <FormulaLine>
            − <V label="Survey" value={formatCurrency(dealTermInputs.survey)} />
          </FormulaLine>
          <FormulaLine>
            − <V label="Appraisal" value={formatCurrency(dealTermInputs.appraisal)} />
          </FormulaLine>
          <FormulaLine>
            − <V label="Inspection" value={formatCurrency(dealTermInputs.inspection)} />
          </FormulaLine>
          <FormulaLine>
            − <V label="Hard Money Lender Fees" value={formatCurrency(hardMoneyInputs.hardLenderAndTitleFees)} />
          </FormulaLine>
          <FormulaLine>
            − <V label="Refi Lender Fees" value={formatCurrency(hardMoneyInputs.refinanceLenderAndTitleFees)} />
          </FormulaLine>
          <FormulaLine>
            − <V label="Refi Appraisal" value={formatCurrency(dealTermInputs.appraisal)} />
          </FormulaLine>
          <FormulaLine isResult>
            = <span className="text-gray-900 dark:text-white">{formatCurrency(result)}</span>
          </FormulaLine>
        </FormulaBlock>
      )}
    </MetricCard>
  );
}

function HardMoneyMonthlyCashflow({ calculator, viewMode }: MetricProps) {
  const result = calculator.hardTotalCashflowMonthly;

  return (
    <MetricCard title="Monthly Cashflow (Post-Refi)">
      {viewMode === 'basic' ? (
        <Formula>Rent − Monthly Expenses (using refi mortgage) = {formatCurrency(result)}/mo</Formula>
      ) : (
        <FormulaBlock>
          <FormulaLine>
            <V label="Monthly Rent" value={formatCurrency(calculator.hardMonthlyRent)} />
          </FormulaLine>
          <FormulaLine>
            − <V label="Refi Mortgage Payment" value={formatCurrency(calculator.hardRefinanceNotePaymentMonthly)} />
          </FormulaLine>
          <FormulaLine>
            − <V label="Property Tax" value={formatCurrency(calculator.hardPropertyTaxMonthly)} />/mo
          </FormulaLine>
          <FormulaLine>
            − <V label="Insurance" value={formatCurrency(calculator.hardPropertyInsuranceMonthly)} />/mo
          </FormulaLine>
          {calculator.hardMortgageInsuranceMonthly > 0 && (
            <FormulaLine>
              − <V label="Mortgage Insurance" value={formatCurrency(calculator.hardMortgageInsuranceMonthly)} />/mo
            </FormulaLine>
          )}
          {calculator.hardHoaMonthly > 0 && (
            <FormulaLine>
              − <V label="HOA" value={formatCurrency(calculator.hardHoaMonthly)} />/mo
            </FormulaLine>
          )}
          {calculator.hardMiscellaneousMonthly > 0 && (
            <FormulaLine>
              − <V label="Miscellaneous" value={formatCurrency(calculator.hardMiscellaneousMonthly)} />/mo
            </FormulaLine>
          )}
          <FormulaLine isResult>
            = <span className="text-gray-900 dark:text-white">{formatCurrency(result)}/mo</span>
          </FormulaLine>
        </FormulaBlock>
      )}
    </MetricCard>
  );
}

function HardMoneyAnnualCashflow({ calculator, viewMode }: MetricProps) {
  const monthly = calculator.hardTotalCashflowMonthly;
  const result = calculator.hardAnnualCashFlow;

  return (
    <MetricCard title="Annual Cashflow">
      {viewMode === 'basic' ? (
        <Formula>Monthly Cashflow × 12 = {formatCurrency(result)}/yr</Formula>
      ) : (
        <FormulaBlock>
          <FormulaLine>
            <V label="Monthly Cashflow" value={formatCurrency(monthly)} /> × 12
          </FormulaLine>
          <FormulaLine isResult>
            = <span className="text-gray-900 dark:text-white">{formatCurrency(result)}/yr</span>
          </FormulaLine>
        </FormulaBlock>
      )}
    </MetricCard>
  );
}

function HardMoneyReturnOnEquity({ calculator, viewMode }: MetricProps) {
  const equity = calculator.hardUnrealizedCapitalGain;
  const cash = calculator.hardCashOutOfPocketTotal;
  const result = calculator.hardReturnOnCapitalGainPercent;

  return (
    <MetricCard title="Return on Equity">
      {viewMode === 'basic' ? (
        <Formula>Equity Capture ÷ Cash Invested × 100 = {formatPercent(result, 1)}</Formula>
      ) : (
        <FormulaBlock>
          <FormulaLine>
            <V label="Equity Capture" value={formatCurrency(equity)} /> ÷ <V label="Cash Invested" value={formatCurrency(cash)} /> × 100
          </FormulaLine>
          <FormulaLine isResult>
            = <span className="text-gray-900 dark:text-white">{formatPercent(result, 1)}</span>
          </FormulaLine>
        </FormulaBlock>
      )}
    </MetricCard>
  );
}

function HardMoneyCashOnCash({ calculator, viewMode }: MetricProps) {
  const annual = calculator.hardAnnualCashFlow;
  const cash = calculator.hardCashOutOfPocketTotal;
  const result = calculator.hardCashOnCashReturnPercent;

  return (
    <MetricCard title="Cash-on-Cash Return">
      {viewMode === 'basic' ? (
        <Formula>Annual Cashflow ÷ Cash Invested × 100 = {formatPercent(result, 1)}</Formula>
      ) : (
        <FormulaBlock>
          <FormulaLine>
            <V label="Annual Cashflow" value={formatCurrency(annual)} /> ÷ <V label="Cash Invested" value={formatCurrency(cash)} /> × 100
          </FormulaLine>
          <FormulaLine isResult>
            = <span className="text-gray-900 dark:text-white">{formatPercent(result, 1)}</span>
          </FormulaLine>
        </FormulaBlock>
      )}
    </MetricCard>
  );
}

function HardMoneyCashNeeded({ calculator, viewMode }: MetricProps) {
  const { dealTermInputs, hardMoneyInputs } = calculator;
  const cashToClose = calculator.hardCashToClose;
  const holdingCost = calculator.hardHoldingCost;
  const refiCashToClose = calculator.hardRefiCashToClose;
  const refiCashBack = calculator.hardRefiCashBack;
  const result = calculator.hardCashOutOfPocketTotal;

  // Calculate intermediate values for display
  const maxLoan = dealTermInputs.estimatedAppraisedValue * (hardMoneyInputs.hardLoanToValuePercent / 100);
  const loanAmount = calculator.hardLoanAmount;
  const monthlyInterest = (loanAmount * (hardMoneyInputs.hardInterestRate / 100)) / 12;
  const totalInterest = monthlyInterest * hardMoneyInputs.hardMonthsToRefinance;
  const monthlyTaxIns = (dealTermInputs.propertyTaxAnnual + dealTermInputs.propertyInsuranceAnnual) / 12;
  const holdingTaxIns = monthlyTaxIns * hardMoneyInputs.hardMonthsToRefinance;
  const weeksToMonths = Math.floor(hardMoneyInputs.hardWeeksUntilLeased / 4.2);
  const rentMonths = hardMoneyInputs.hardMonthsToRefinance - weeksToMonths;
  const rentCollected = rentMonths > 0 ? rentMonths * dealTermInputs.rent : 0;

  const refiMaxLoan = dealTermInputs.estimatedAppraisedValue * (hardMoneyInputs.refinanceLoanToValuePercent / 100);

  return (
    <MetricCard title="Cash Needed">
      {viewMode === 'basic' ? (
        <Formula>Initial Close + Holding Costs + Refi Close − Cashback = {formatCurrency(result)}</Formula>
      ) : (
        <FormulaBlock>
          <SubHeader>Phase 1: Hard Money Close</SubHeader>
          <FormulaLine>
            Max Loan = <V label="Appraised Value" value={formatCurrency(dealTermInputs.estimatedAppraisedValue)} /> × <V label="LTV" value={`${hardMoneyInputs.hardLoanToValuePercent}%`} /> = {formatCurrency(maxLoan)}
          </FormulaLine>
          <FormulaLine>
            Loan Amount = {formatCurrency(loanAmount)} (capped at what's needed)
          </FormulaLine>
          <FormulaLine>
            Cash to Close = {formatCurrency(cashToClose)}
          </FormulaLine>

          <SubHeader>Phase 2: Holding Period</SubHeader>
          <FormulaLine>
            Interest = <V label="Loan" value={formatCurrency(loanAmount)} /> × <V label="Rate" value={`${hardMoneyInputs.hardInterestRate}%`} /> ÷ 12 × <V label="Months" value={String(hardMoneyInputs.hardMonthsToRefinance)} /> = {formatCurrency(totalInterest)}
          </FormulaLine>
          <FormulaLine>
            Tax & Insurance = (<V label="Tax" value={formatCurrency(dealTermInputs.propertyTaxAnnual)} /> + <V label="Ins" value={formatCurrency(dealTermInputs.propertyInsuranceAnnual)} />) ÷ 12 × <V label="Months" value={String(hardMoneyInputs.hardMonthsToRefinance)} /> = {formatCurrency(holdingTaxIns)}
          </FormulaLine>
          {rentCollected > 0 && (
            <FormulaLine>
              − Rent Collected = <V label="Rent" value={formatCurrency(dealTermInputs.rent)} /> × <V label="Months Leased" value={String(rentMonths)} /> = −{formatCurrency(rentCollected)}
            </FormulaLine>
          )}
          <FormulaLine>
            Holding Cost = {formatCurrency(holdingCost)}
          </FormulaLine>

          <SubHeader>Phase 3: Refinance Close</SubHeader>
          <FormulaLine>
            Max Refi Loan = <V label="Appraised Value" value={formatCurrency(dealTermInputs.estimatedAppraisedValue)} /> × <V label="Refi LTV" value={`${hardMoneyInputs.refinanceLoanToValuePercent}%`} /> = {formatCurrency(refiMaxLoan)}
          </FormulaLine>
          <FormulaLine>
            Cash to Close = {formatCurrency(refiCashToClose)}
          </FormulaLine>

          <SubHeader>Phase 4: Net Cashback</SubHeader>
          <FormulaLine>
            Cashback from Refi = {refiCashBack < 0 ? `−${formatCurrency(Math.abs(refiCashBack))}` : formatCurrency(refiCashBack)}
            {dealTermInputs.maxRefiCashback > 0 && refiCashBack < 0 && Math.abs(refiCashBack) >= dealTermInputs.maxRefiCashback && (
              <> (capped at <V label="Max Cashback" value={formatCurrency(dealTermInputs.maxRefiCashback)} />)</>
            )}
          </FormulaLine>

          <SubHeader>Total</SubHeader>
          <FormulaLine>
            <V label="Phase 1" value={formatCurrency(cashToClose)} /> + <V label="Phase 2" value={formatCurrency(holdingCost)} /> + <V label="Phase 3" value={formatCurrency(refiCashToClose)} /> + <V label="Phase 4" value={refiCashBack < 0 ? `−${formatCurrency(Math.abs(refiCashBack))}` : formatCurrency(refiCashBack)} />
          </FormulaLine>
          <FormulaLine isResult>
            = <span className="text-gray-900 dark:text-white">{formatCurrency(result)}</span>
          </FormulaLine>
        </FormulaBlock>
      )}
    </MetricCard>
  );
}
