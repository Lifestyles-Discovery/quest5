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
    width: '16.66%',
    marginBottom: 10,
  },
  itemDouble: {
    width: '33.33%',
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
  // Listing Info styles
  listingInfoContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  listingInfoTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  listingInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  listingInfoItem: {
    width: '16.66%',
    marginBottom: 6,
  },
  listingInfoLabel: {
    fontSize: 7,
    color: colors.textSecondary,
    marginBottom: 1,
  },
  listingInfoValue: {
    fontSize: 9,
    color: colors.textPrimary,
  },
  // Property Description styles
  descriptionContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  descriptionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 9,
    color: colors.textSecondary,
    lineHeight: 1.4,
  },
});

interface AttributeItemProps {
  label: string;
  value: string;
  double?: boolean;
}

function AttributeItem({ label, value, double }: AttributeItemProps) {
  return (
    <View style={double ? attrStyles.itemDouble : attrStyles.item}>
      <Text style={attrStyles.label}>{label}</Text>
      <Text style={attrStyles.value}>{value}</Text>
    </View>
  );
}

function formatDate(dateString: string | null | undefined): string | null {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ListingInfo({ evaluation }: { evaluation: Evaluation }) {
  const items = [
    { label: 'MLS #', value: evaluation.mlsNumber },
    { label: 'Market', value: evaluation.mlsMarket },
    { label: 'Listing Office', value: evaluation.listingOfficeName },
    { label: 'List Date', value: formatDate(evaluation.listDate) },
    { label: 'Date Sold', value: formatDate(evaluation.dateSold) },
    { label: 'Data Source', value: evaluation.compDataSource },
  ].filter((item) => item.value);

  if (items.length === 0) return null;

  return (
    <View style={attrStyles.listingInfoContainer}>
      <Text style={attrStyles.listingInfoTitle}>Listing Info</Text>
      <View style={attrStyles.listingInfoGrid}>
        {items.map(({ label, value }) => (
          <View key={label} style={attrStyles.listingInfoItem}>
            <Text style={attrStyles.listingInfoLabel}>{label}</Text>
            <Text style={attrStyles.listingInfoValue}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function PropertyDescription({ description }: { description: string }) {
  return (
    <View style={attrStyles.descriptionContainer}>
      <Text style={attrStyles.descriptionTitle}>Property Description</Text>
      <Text style={attrStyles.descriptionText}>{description}</Text>
    </View>
  );
}

/**
 * Property attributes section displaying key property details in a grid layout.
 */
export function PDFPropertyAttributes({ evaluation }: PDFPropertyAttributesProps) {
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
        <AttributeItem label="Subdivision" value={evaluation.subdivision || '-'} double />
        <AttributeItem label="County" value={evaluation.county || '-'} />
        <AttributeItem label="Taxes/Year" value={`${formatCurrency(evaluation.taxesAnnual)}/yr`} />
        <AttributeItem label="HOA/Year" value={`${formatCurrency(evaluation.hoaAnnual)}/yr`} />
      </View>

      {/* Listing Info */}
      <ListingInfo evaluation={evaluation} />

      {/* Property Description */}
      {evaluation.descriptionPublic && <PropertyDescription description={evaluation.descriptionPublic} />}
    </View>
  );
}
