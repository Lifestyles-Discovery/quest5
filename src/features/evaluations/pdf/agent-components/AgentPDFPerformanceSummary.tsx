import { AgentPDFTable, type TableRow } from './AgentPDFTable';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import type { Calculator } from '@app-types/evaluation.types';

interface AgentPDFPerformanceSummaryProps {
  calculator: Calculator;
  scenarioType: 'conventional' | 'hardMoney';
}

/**
 * Performance Summary table showing key investment metrics.
 * Displays: Equity Capture, Annual Cashflow, Return on Equity, Cash-on-Cash Return
 */
export function AgentPDFPerformanceSummary({
  calculator,
  scenarioType,
}: AgentPDFPerformanceSummaryProps) {
  const isConventional = scenarioType === 'conventional';

  const equityCapture = isConventional
    ? calculator.conventionalUnrealizedCapitalGain
    : calculator.hardUnrealizedCapitalGain;

  const annualCashflow = isConventional
    ? calculator.conventionalAnnualCashFlow
    : calculator.hardAnnualCashFlow;

  const returnOnEquity = isConventional
    ? calculator.conventionalReturnOnCapitalGainPercent
    : calculator.hardReturnOnCapitalGainPercent;

  const cashOnCash = isConventional
    ? calculator.conventionalCashOnCashReturnPercent
    : calculator.hardCashOnCashReturnPercent;

  const rows: TableRow[] = [
    {
      label: 'Equity Capture',
      value: formatCurrency(equityCapture || 0),
      isBold: true,
    },
    {
      label: 'Annual Cashflow',
      value: `${formatCurrency(annualCashflow || 0)} / year`,
      isBold: true,
    },
    {
      label: 'Return on Equity',
      value: formatPercent(returnOnEquity || 0, 1),
      isBold: true,
    },
    {
      label: 'Cash-on-Cash Return',
      value: formatPercent(cashOnCash || 0, 1),
      isBold: true,
    },
  ];

  return (
    <AgentPDFTable
      title="Performance Summary"
      rows={rows}
      headerLabels={{ label: 'Metric', value: 'Value' }}
    />
  );
}
