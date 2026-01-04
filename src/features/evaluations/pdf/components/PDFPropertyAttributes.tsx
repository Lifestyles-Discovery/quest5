import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import type { Evaluation } from '@app-types/evaluation.types';

interface PDFPropertyAttributesProps {
  evaluation: Evaluation;
}

const attrStyles = StyleSheet.create({
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
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    width: '20%',
    marginBottom: 10,
  },
  label: {
    fontSize: 8,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.textPrimary,
  },
});

interface AttributeItemProps {
  label: string;
  value: string;
}

function AttributeItem({ label, value }: AttributeItemProps) {
  return (
    <View style={attrStyles.item}>
      <Text style={attrStyles.label}>{label}</Text>
      <Text style={attrStyles.value}>{value}</Text>
    </View>
  );
}

/**
 * Property attributes section displaying key property details in a grid layout.
 */
export function PDFPropertyAttributes({ evaluation }: PDFPropertyAttributesProps) {
  const { calculator } = evaluation;

  return (
    <View style={attrStyles.container} wrap={false}>
      <Text style={attrStyles.title}>Property Attributes</Text>
      <View style={attrStyles.grid}>
        <AttributeItem label="Beds" value={evaluation.beds != null ? `${evaluation.beds} beds` : '-'} />
        <AttributeItem label="Baths" value={evaluation.baths != null ? `${evaluation.baths} baths` : '-'} />
        <AttributeItem label="Garage" value={evaluation.garage != null ? `${evaluation.garage} car` : '-'} />
        <AttributeItem label="Sqft" value={evaluation.sqft ? `${formatNumber(evaluation.sqft)} sqft` : '-'} />
        <AttributeItem label="Year Built" value={evaluation.yearBuilt ? String(evaluation.yearBuilt) : '-'} />
        <AttributeItem label="List Price" value={formatCurrency(evaluation.listPrice)} />
        <AttributeItem label="Subdivision" value={evaluation.subdivision || '-'} />
        <AttributeItem label="County" value={evaluation.county || '-'} />
        <AttributeItem
          label="Taxes/Year"
          value={`${formatCurrency(calculator?.dealTermInputs?.propertyTaxAnnual || 0)}/yr`}
        />
        <AttributeItem
          label="HOA/Year"
          value={`${formatCurrency(calculator?.dealTermInputs?.hoaAnnual || 0)}/yr`}
        />
      </View>
    </View>
  );
}
