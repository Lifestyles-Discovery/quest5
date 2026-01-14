import { AgentPDFTable, type TableRow } from './AgentPDFTable';
import { formatCurrency } from '@/utils/formatters';
import type { Calculator } from '@app-types/evaluation.types';

interface AgentPDFCashOutOfPocketProps {
  calculator: Calculator;
  scenarioType: 'conventional' | 'hardMoney';
}

/**
 * Cash Out of Pocket table showing upfront investment breakdown.
 */
export function AgentPDFCashOutOfPocket({
  calculator,
  scenarioType,
}: AgentPDFCashOutOfPocketProps) {
  const isConventional = scenarioType === 'conventional';

  let rows: TableRow[];

  if (isConventional) {
    rows = [
      {
        label: 'Down Payment',
        value: formatCurrency(calculator.conventionalDownpayment || 0),
      },
      {
        label: 'Closing Costs',
        value: formatCurrency(calculator.conventionalClosingCosts || 0),
      },
      {
        label: 'Prepaid Expenses',
        value: formatCurrency(calculator.conventionalPrepaidExpenses || 0),
      },
      {
        label: 'Repairs',
        value: formatCurrency(calculator.conventionalRepairsMakeReady || 0),
      },
      {
        label: 'Total Cash Out of Pocket',
        value: formatCurrency(calculator.conventionalCashOutOfPocketTotal || 0),
        isBold: true,
        isTotal: true,
      },
    ];
  } else {
    // Hard Money scenario
    rows = [
      {
        label: 'Hard Cash to Close',
        value: formatCurrency(calculator.hardCashToClose || 0),
      },
      {
        label: 'Holding Costs',
        value: formatCurrency(calculator.hardHoldingCost || 0),
      },
      {
        label: 'Refi Cash to Close',
        value: formatCurrency(calculator.hardRefiCashToClose || 0),
      },
      {
        label: 'Refi Cashback',
        value: formatCurrency(-(calculator.hardRefiCashBack || 0)),
      },
      {
        label: 'Total Cash Out of Pocket',
        value: formatCurrency(calculator.hardCashOutOfPocketTotal || 0),
        isBold: true,
        isTotal: true,
      },
    ];
  }

  return (
    <AgentPDFTable
      title="Cash Out of Pocket"
      rows={rows}
      headerLabels={{ label: 'Item', value: 'Amount' }}
    />
  );
}
