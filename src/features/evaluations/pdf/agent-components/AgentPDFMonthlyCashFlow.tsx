import { AgentPDFTable, type TableRow } from './AgentPDFTable';
import { formatCurrency } from '@/utils/formatters';
import type { Calculator } from '@app-types/evaluation.types';

interface AgentPDFMonthlyCashFlowProps {
  calculator: Calculator;
  scenarioType: 'conventional' | 'hardMoney';
}

/**
 * Monthly Cash Flow table showing income and expense breakdown.
 */
export function AgentPDFMonthlyCashFlow({
  calculator,
  scenarioType,
}: AgentPDFMonthlyCashFlowProps) {
  const isConventional = scenarioType === 'conventional';

  const monthlyRent = isConventional
    ? calculator.conventionalMonthlyRent
    : calculator.hardMonthlyRent;

  const notePayment = isConventional
    ? calculator.conventionalNotePaymentMonthly
    : calculator.hardRefinanceNotePaymentMonthly;

  const propertyTax = isConventional
    ? calculator.conventionalPropertyTaxMonthly
    : calculator.hardPropertyTaxMonthly;

  const propertyInsurance = isConventional
    ? calculator.conventionalPropertyInsuranceMonthly
    : calculator.hardPropertyInsuranceMonthly;

  const mortgageInsurance = isConventional
    ? calculator.conventionalMortgageInsuranceMonthly
    : calculator.hardMortgageInsuranceMonthly;

  const hoa = isConventional
    ? calculator.conventionalHoaMonthly
    : calculator.hardHoaMonthly;

  const misc = isConventional
    ? calculator.conventionalMiscellaneousMonthly
    : calculator.hardMiscellaneousMonthly;

  const totalCashflow = isConventional
    ? calculator.conventionalTotalCashflowMonthly
    : calculator.hardTotalCashflowMonthly;

  const rows: TableRow[] = [
    {
      label: 'Monthly Rent',
      value: formatCurrency(monthlyRent || 0),
      valueColor: 'positive',
    },
    {
      label: 'Note Payment',
      value: formatCurrency(-(notePayment || 0)),
    },
    {
      label: 'Property Tax',
      value: formatCurrency(-(propertyTax || 0)),
    },
    {
      label: 'Property Insurance',
      value: formatCurrency(-(propertyInsurance || 0)),
    },
    {
      label: 'Mortgage Insurance',
      value: formatCurrency(-(mortgageInsurance || 0)),
    },
    {
      label: 'HOA',
      value: formatCurrency(-(hoa || 0)),
    },
    {
      label: 'Misc Monthly',
      value: formatCurrency(-(misc || 0)),
    },
    {
      label: 'Total Monthly Cash Flow',
      value: formatCurrency(totalCashflow || 0),
      isBold: true,
      isTotal: true,
      valueColor: (totalCashflow || 0) >= 0 ? 'positive' : 'negative',
    },
  ];

  return (
    <AgentPDFTable
      title="Monthly Cash Flow"
      rows={rows}
      headerLabels={{ label: 'Item', value: 'Amount' }}
    />
  );
}
