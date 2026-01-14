import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { agentColors } from './agentStyles';
import { formatCurrency } from '@/utils/formatters';
import type { Calculator } from '@app-types/evaluation.types';

interface AgentPDFLoanTermsProps {
  calculator: Calculator;
  scenarioType: 'conventional' | 'hardMoney';
}

const loanStyles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: agentColors.textPrimary,
    marginBottom: 12,
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: agentColors.border,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: agentColors.borderLight,
  },
  rowLast: {
    flexDirection: 'row',
  },
  cellLabel: {
    width: '50%',
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: agentColors.borderLight,
  },
  cellValue: {
    width: '50%',
    padding: 10,
  },
  text: {
    fontSize: 14,
    color: agentColors.textPrimary,
  },
  textBold: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: agentColors.textPrimary,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: agentColors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
});

interface LoanTermRow {
  label: string;
  value: string;
}

function LoanTermsTable({ title, rows }: { title: string; rows: LoanTermRow[] }) {
  return (
    <View style={loanStyles.container} wrap={false}>
      <Text style={loanStyles.title}>{title}</Text>
      <View style={loanStyles.table}>
        {rows.map((row, index) => {
          const isLast = index === rows.length - 1;
          return (
            <View key={index} style={isLast ? loanStyles.rowLast : loanStyles.row}>
              <View style={loanStyles.cellLabel}>
                <Text style={loanStyles.text}>{row.label}</Text>
              </View>
              <View style={loanStyles.cellValue}>
                <Text style={loanStyles.textBold}>{row.value}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Loan Terms section showing financing parameters.
 * For Hard Money, shows both Hard Money Loan and Refinance terms.
 */
export function AgentPDFLoanTerms({ calculator, scenarioType }: AgentPDFLoanTermsProps) {
  const { conventionalInputs, hardMoneyInputs } = calculator;

  if (scenarioType === 'conventional') {
    const rows: LoanTermRow[] = [
      { label: 'Down Payment', value: `${conventionalInputs.downPaymentPercent}%` },
      { label: 'Interest Rate', value: `${conventionalInputs.interestRatePercent}%` },
      { label: 'Loan Term', value: `${conventionalInputs.loanTermInYears} years` },
      { label: 'Lender/Title Fees', value: formatCurrency(conventionalInputs.lenderAndTitleFees || 0) },
      { label: 'Escrow', value: `${conventionalInputs.monthsTaxAndInsurance} months` },
      { label: 'Mortgage Insurance/yr', value: formatCurrency(conventionalInputs.mortgageInsuranceAnnual || 0) },
    ];

    return <LoanTermsTable title="Loan Terms" rows={rows} />;
  }

  // Hard Money scenario - show both Hard Money and Refinance sections
  return (
    <View>
      <LoanTermsTable
        title="Hard Money Loan"
        rows={[
          { label: 'LTV', value: `${hardMoneyInputs.hardLoanToValuePercent}%` },
          { label: 'Interest Rate', value: `${hardMoneyInputs.hardInterestRate}%` },
          { label: 'Months to Refinance', value: `${hardMoneyInputs.hardMonthsToRefinance} mo` },
          { label: 'Lender Fees', value: formatCurrency(hardMoneyInputs.hardLenderAndTitleFees || 0) },
          { label: 'Weeks to Lease', value: `${hardMoneyInputs.hardWeeksUntilLeased}` },
          { label: 'Roll in Fees', value: hardMoneyInputs.hardRollInLenderFees ? 'Yes' : 'No' },
        ]}
      />
      <LoanTermsTable
        title="Refinance"
        rows={[
          { label: 'LTV', value: `${hardMoneyInputs.refinanceLoanToValuePercent}%` },
          { label: 'Interest Rate', value: `${hardMoneyInputs.refinanceInterestRatePercent}%` },
          { label: 'Loan Term', value: `${hardMoneyInputs.refinanceLoanTermInYears} years` },
          { label: 'Lender Fees', value: formatCurrency(hardMoneyInputs.refinanceLenderAndTitleFees || 0) },
          { label: 'Escrow', value: `${hardMoneyInputs.refinanceMonthsTaxAndInsurance} mo` },
          { label: 'Mortgage Insurance/yr', value: formatCurrency(hardMoneyInputs.refinanceMortgageInsuranceAnnual || 0) },
        ]}
      />
    </View>
  );
}
