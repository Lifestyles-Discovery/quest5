import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import type { Calculator } from '@app-types/evaluation.types';

interface PDFCalculatorResultsProps {
  calculator: Calculator;
}

const calcStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  title: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  columns: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  columnHeader: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  // Key metrics section
  keyMetrics: {
    marginBottom: 10,
  },
  metricItem: {
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 8,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  metricValueLarge: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
  },
  metricValueMedium: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  // Details section
  detailsSection: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 9,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.textPrimary,
  },
  // Loan terms section
  loanTermsSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  loanTermsTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  loanTermsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  loanTermItem: {
    width: '50%',
    marginBottom: 4,
  },
  loanTermText: {
    fontSize: 8,
    color: colors.textSecondary,
  },
  loanTermValue: {
    fontFamily: 'Helvetica-Bold',
    color: colors.textPrimary,
  },
  emptyMessage: {
    fontSize: 10,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

/**
 * Calculator results section showing side-by-side comparison of
 * Conventional vs Hard Money financing scenarios.
 */
export function PDFCalculatorResults({ calculator }: PDFCalculatorResultsProps) {
  const { conventionalInputs, hardMoneyInputs } = calculator;

  const showConventional = conventionalInputs?.show;
  const showHardMoney = hardMoneyInputs?.show;

  if (!showConventional && !showHardMoney) {
    return (
      <View style={calcStyles.container}>
        <Text style={calcStyles.title}>Analysis</Text>
        <Text style={calcStyles.emptyMessage}>No financing scenarios enabled</Text>
      </View>
    );
  }

  return (
    <View style={calcStyles.container} wrap={false}>
      <Text style={calcStyles.title}>Analysis</Text>

      <View style={calcStyles.columns}>
        {/* Conventional Column */}
        {showConventional && (
          <View style={calcStyles.column}>
            <Text style={calcStyles.columnHeader}>Conventional</Text>

            {/* Key Metrics */}
            <View style={calcStyles.keyMetrics}>
              <View style={calcStyles.metricItem}>
                <Text style={calcStyles.metricLabel}>Equity Capture</Text>
                <Text style={calcStyles.metricValueLarge}>
                  {formatCurrency(calculator.conventionalUnrealizedCapitalGain || 0)}
                </Text>
              </View>
              <View style={calcStyles.metricItem}>
                <Text style={calcStyles.metricLabel}>Annual Cashflow</Text>
                <Text style={calcStyles.metricValueLarge}>
                  {formatCurrency(calculator.conventionalAnnualCashFlow || 0)}/yr
                </Text>
              </View>
              <View style={calcStyles.metricItem}>
                <Text style={calcStyles.metricLabel}>Return on Equity</Text>
                <Text style={calcStyles.metricValueMedium}>
                  {formatPercent(calculator.conventionalReturnOnCapitalGainPercent || 0, 1)}
                </Text>
              </View>
              <View style={calcStyles.metricItem}>
                <Text style={calcStyles.metricLabel}>Cash-on-Cash Return</Text>
                <Text style={calcStyles.metricValueMedium}>
                  {formatPercent(calculator.conventionalCashOnCashReturnPercent || 0, 1)}
                </Text>
              </View>
            </View>

            {/* Details */}
            <View style={calcStyles.detailsSection}>
              <View style={calcStyles.detailRow}>
                <Text style={calcStyles.detailLabel}>Cash Needed</Text>
                <Text style={calcStyles.detailValue}>{formatCurrency(calculator.conventionalCashOutOfPocketTotal || 0)}</Text>
              </View>
              <View style={calcStyles.detailRow}>
                <Text style={calcStyles.detailLabel}>Monthly Cashflow</Text>
                <Text style={calcStyles.detailValue}>
                  {formatCurrency(calculator.conventionalTotalCashflowMonthly || 0)}/mo
                </Text>
              </View>
            </View>

            {/* Loan Terms */}
            <View style={calcStyles.loanTermsSection}>
              <Text style={calcStyles.loanTermsTitle}>Loan Terms</Text>
              <View style={calcStyles.loanTermsGrid}>
                <View style={calcStyles.loanTermItem}>
                  <Text style={calcStyles.loanTermText}>
                    Down: <Text style={calcStyles.loanTermValue}>{conventionalInputs.downPaymentPercent}%</Text>
                  </Text>
                </View>
                <View style={calcStyles.loanTermItem}>
                  <Text style={calcStyles.loanTermText}>
                    Rate: <Text style={calcStyles.loanTermValue}>{conventionalInputs.interestRatePercent}%</Text>
                  </Text>
                </View>
                <View style={calcStyles.loanTermItem}>
                  <Text style={calcStyles.loanTermText}>
                    Term: <Text style={calcStyles.loanTermValue}>{conventionalInputs.loanTermInYears} yrs</Text>
                  </Text>
                </View>
                <View style={calcStyles.loanTermItem}>
                  <Text style={calcStyles.loanTermText}>
                    Fees: <Text style={calcStyles.loanTermValue}>{formatCurrency(conventionalInputs.lenderAndTitleFees || 0)}</Text>
                  </Text>
                </View>
                <View style={calcStyles.loanTermItem}>
                  <Text style={calcStyles.loanTermText}>
                    Escrow: <Text style={calcStyles.loanTermValue}>{conventionalInputs.monthsTaxAndInsurance} mo</Text>
                  </Text>
                </View>
                <View style={calcStyles.loanTermItem}>
                  <Text style={calcStyles.loanTermText}>
                    MI/yr: <Text style={calcStyles.loanTermValue}>{formatCurrency(conventionalInputs.mortgageInsuranceAnnual || 0)}</Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Hard Money Column */}
        {showHardMoney && (
          <View style={calcStyles.column}>
            <Text style={calcStyles.columnHeader}>Hard Money + Refi</Text>

            {/* Key Metrics */}
            <View style={calcStyles.keyMetrics}>
              <View style={calcStyles.metricItem}>
                <Text style={calcStyles.metricLabel}>Equity Capture</Text>
                <Text style={calcStyles.metricValueLarge}>
                  {formatCurrency(calculator.hardUnrealizedCapitalGain || 0)}
                </Text>
              </View>
              <View style={calcStyles.metricItem}>
                <Text style={calcStyles.metricLabel}>Annual Cashflow</Text>
                <Text style={calcStyles.metricValueLarge}>
                  {formatCurrency(calculator.hardAnnualCashFlow || 0)}/yr
                </Text>
              </View>
              <View style={calcStyles.metricItem}>
                <Text style={calcStyles.metricLabel}>Return on Equity</Text>
                <Text style={calcStyles.metricValueMedium}>
                  {formatPercent(calculator.hardReturnOnCapitalGainPercent || 0, 1)}
                </Text>
              </View>
              <View style={calcStyles.metricItem}>
                <Text style={calcStyles.metricLabel}>Cash-on-Cash Return</Text>
                <Text style={calcStyles.metricValueMedium}>
                  {formatPercent(calculator.hardCashOnCashReturnPercent || 0, 1)}
                </Text>
              </View>
            </View>

            {/* Details */}
            <View style={calcStyles.detailsSection}>
              <View style={calcStyles.detailRow}>
                <Text style={calcStyles.detailLabel}>Cash Needed</Text>
                <Text style={calcStyles.detailValue}>{formatCurrency(calculator.hardCashOutOfPocketTotal || 0)}</Text>
              </View>
              <View style={calcStyles.detailRow}>
                <Text style={calcStyles.detailLabel}>Monthly Cashflow</Text>
                <Text style={calcStyles.detailValue}>
                  {formatCurrency(calculator.hardTotalCashflowMonthly || 0)}/mo
                </Text>
              </View>
            </View>

            {/* Loan Terms */}
            <View style={calcStyles.loanTermsSection}>
              <Text style={calcStyles.loanTermsTitle}>Hard Money Loan</Text>
              <View style={calcStyles.loanTermsGrid}>
                <View style={calcStyles.loanTermItem}>
                  <Text style={calcStyles.loanTermText}>
                    LTV: <Text style={calcStyles.loanTermValue}>{hardMoneyInputs.hardLoanToValuePercent}%</Text>
                  </Text>
                </View>
                <View style={calcStyles.loanTermItem}>
                  <Text style={calcStyles.loanTermText}>
                    Rate: <Text style={calcStyles.loanTermValue}>{hardMoneyInputs.hardInterestRate}%</Text>
                  </Text>
                </View>
                <View style={calcStyles.loanTermItem}>
                  <Text style={calcStyles.loanTermText}>
                    Refi: <Text style={calcStyles.loanTermValue}>{hardMoneyInputs.hardMonthsToRefinance} mo</Text>
                  </Text>
                </View>
                <View style={calcStyles.loanTermItem}>
                  <Text style={calcStyles.loanTermText}>
                    Fees: <Text style={calcStyles.loanTermValue}>{formatCurrency(hardMoneyInputs.hardLenderAndTitleFees || 0)}</Text>
                  </Text>
                </View>
                <View style={calcStyles.loanTermItem}>
                  <Text style={calcStyles.loanTermText}>
                    Wks to Lease: <Text style={calcStyles.loanTermValue}>{hardMoneyInputs.hardWeeksUntilLeased}</Text>
                  </Text>
                </View>
                <View style={calcStyles.loanTermItem}>
                  <Text style={calcStyles.loanTermText}>
                    Roll in Fees: <Text style={calcStyles.loanTermValue}>{hardMoneyInputs.hardRollInLenderFees ? 'Yes' : 'No'}</Text>
                  </Text>
                </View>
              </View>

              <Text style={[calcStyles.loanTermsTitle, { marginTop: 6 }]}>Refinance</Text>
              <View style={calcStyles.loanTermsGrid}>
                <View style={calcStyles.loanTermItem}>
                  <Text style={calcStyles.loanTermText}>
                    LTV: <Text style={calcStyles.loanTermValue}>{hardMoneyInputs.refinanceLoanToValuePercent}%</Text>
                  </Text>
                </View>
                <View style={calcStyles.loanTermItem}>
                  <Text style={calcStyles.loanTermText}>
                    Rate: <Text style={calcStyles.loanTermValue}>{hardMoneyInputs.refinanceInterestRatePercent}%</Text>
                  </Text>
                </View>
                <View style={calcStyles.loanTermItem}>
                  <Text style={calcStyles.loanTermText}>
                    Term: <Text style={calcStyles.loanTermValue}>{hardMoneyInputs.refinanceLoanTermInYears} yrs</Text>
                  </Text>
                </View>
                <View style={calcStyles.loanTermItem}>
                  <Text style={calcStyles.loanTermText}>
                    Fees: <Text style={calcStyles.loanTermValue}>{formatCurrency(hardMoneyInputs.refinanceLenderAndTitleFees || 0)}</Text>
                  </Text>
                </View>
                <View style={calcStyles.loanTermItem}>
                  <Text style={calcStyles.loanTermText}>
                    Escrow: <Text style={calcStyles.loanTermValue}>{hardMoneyInputs.refinanceMonthsTaxAndInsurance} mo</Text>
                  </Text>
                </View>
                <View style={calcStyles.loanTermItem}>
                  <Text style={calcStyles.loanTermText}>
                    MI/yr: <Text style={calcStyles.loanTermValue}>{formatCurrency(hardMoneyInputs.refinanceMortgageInsuranceAnnual || 0)}</Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
