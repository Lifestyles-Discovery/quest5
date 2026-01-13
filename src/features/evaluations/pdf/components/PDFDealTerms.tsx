import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles';
import { formatCurrency } from '@/utils/formatters';
import type { Calculator } from '@app-types/evaluation.types';

interface PDFDealTermsProps {
  calculator: Calculator;
}

const dealStyles = StyleSheet.create({
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
  primaryRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  primaryItem: {
    width: '25%',
  },
  primaryLabel: {
    fontSize: 8,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  primaryValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: colors.textPrimary,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 4,
  },
  costsTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  costsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  costItem: {
    width: '25%',
    marginBottom: 6,
  },
  costLabel: {
    fontSize: 8,
    color: colors.textSecondary,
    marginBottom: 1,
  },
  costValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.textPrimary,
  },
});

/**
 * Deal terms section showing purchase price, market value, rent, repairs,
 * and associated costs/adjustments.
 */
export function PDFDealTerms({ calculator }: PDFDealTermsProps) {
  const { dealTermInputs, hardMoneyInputs } = calculator;
  const showHardMoney = hardMoneyInputs?.show;
  const primaryItemWidth = showHardMoney ? '20%' : '25%';

  return (
    <View style={dealStyles.container} wrap={false}>
      <Text style={dealStyles.title}>The Deal</Text>

      {/* Primary Metrics */}
      <View style={dealStyles.primaryRow}>
        <View style={{ ...dealStyles.primaryItem, width: primaryItemWidth }}>
          <Text style={dealStyles.primaryLabel}>Purchase Price</Text>
          <Text style={dealStyles.primaryValue}>{formatCurrency(dealTermInputs?.purchasePrice || 0)}</Text>
        </View>
        <View style={{ ...dealStyles.primaryItem, width: primaryItemWidth }}>
          <Text style={dealStyles.primaryLabel}>Market Value</Text>
          <Text style={dealStyles.primaryValue}>{formatCurrency(dealTermInputs?.estimatedMarketValue || 0)}</Text>
        </View>
        {showHardMoney && (
          <View style={{ ...dealStyles.primaryItem, width: primaryItemWidth }}>
            <Text style={dealStyles.primaryLabel}>Hard Appraised Value</Text>
            <Text style={dealStyles.primaryValue}>{formatCurrency(dealTermInputs?.estimatedAppraisedValue || 0)}</Text>
          </View>
        )}
        <View style={{ ...dealStyles.primaryItem, width: primaryItemWidth }}>
          <Text style={dealStyles.primaryLabel}>Monthly Rent</Text>
          <Text style={dealStyles.primaryValue}>{formatCurrency(dealTermInputs?.rent || 0)}</Text>
        </View>
        <View style={{ ...dealStyles.primaryItem, width: primaryItemWidth }}>
          <Text style={dealStyles.primaryLabel}>Repairs</Text>
          <Text style={dealStyles.primaryValue}>{formatCurrency(dealTermInputs?.repairsMakeReady || 0)}</Text>
        </View>
      </View>

      {/* Costs & Adjustments */}
      <View style={dealStyles.divider}>
        <Text style={dealStyles.costsTitle}>Costs & Adjustments</Text>
        <View style={dealStyles.costsGrid}>
          <View style={dealStyles.costItem}>
            <Text style={dealStyles.costLabel}>Property Tax</Text>
            <Text style={dealStyles.costValue}>
              {formatCurrency(dealTermInputs?.propertyTaxAnnual || 0)}/yr
            </Text>
          </View>
          <View style={dealStyles.costItem}>
            <Text style={dealStyles.costLabel}>Insurance</Text>
            <Text style={dealStyles.costValue}>
              {formatCurrency(dealTermInputs?.propertyInsuranceAnnual || 0)}/yr
            </Text>
          </View>
          <View style={dealStyles.costItem}>
            <Text style={dealStyles.costLabel}>HOA</Text>
            <Text style={dealStyles.costValue}>{formatCurrency(dealTermInputs?.hoaAnnual || 0)}/yr</Text>
          </View>
          <View style={dealStyles.costItem}>
            <Text style={dealStyles.costLabel}>Seller Credit</Text>
            <Text style={dealStyles.costValue}>{formatCurrency(dealTermInputs?.sellerContribution || 0)}</Text>
          </View>
          {!showHardMoney && (
            <View style={dealStyles.costItem}>
              <Text style={dealStyles.costLabel}>Hard Appraised Value</Text>
              <Text style={dealStyles.costValue}>{formatCurrency(dealTermInputs?.estimatedAppraisedValue || 0)}</Text>
            </View>
          )}
          <View style={dealStyles.costItem}>
            <Text style={dealStyles.costLabel}>Max Refi Cashback</Text>
            <Text style={dealStyles.costValue}>{formatCurrency(dealTermInputs?.maxRefiCashback || 0)}</Text>
          </View>
          <View style={dealStyles.costItem}>
            <Text style={dealStyles.costLabel}>Misc Monthly</Text>
            <Text style={dealStyles.costValue}>
              {formatCurrency(dealTermInputs?.miscellaneousMonthly || 0)}/mo
            </Text>
          </View>
          <View style={dealStyles.costItem}>
            <Text style={dealStyles.costLabel}>Survey</Text>
            <Text style={dealStyles.costValue}>{formatCurrency(dealTermInputs?.survey || 0)}</Text>
          </View>
          <View style={dealStyles.costItem}>
            <Text style={dealStyles.costLabel}>Appraisal</Text>
            <Text style={dealStyles.costValue}>{formatCurrency(dealTermInputs?.appraisal || 0)}</Text>
          </View>
          <View style={dealStyles.costItem}>
            <Text style={dealStyles.costLabel}>Inspection</Text>
            <Text style={dealStyles.costValue}>{formatCurrency(dealTermInputs?.inspection || 0)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
