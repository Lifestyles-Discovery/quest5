import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import type { SaleComp, RentComp } from '@app-types/evaluation.types';

type CompType = 'sale' | 'rent';

interface PDFCompsTableProps {
  title: string;
  comps: (SaleComp | RentComp)[];
  calculatedValue: number;
  averagePricePerSqft: number;
  subjectSqft: number;
  type: CompType;
}

const tableStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calculatedValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: colors.textPrimary,
  },
  count: {
    fontSize: 9,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    color: colors.textSecondary,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: 4,
    minHeight: 24,
  },
  tableCell: {
    fontSize: 9,
    color: colors.textPrimary,
  },
  tableCellBold: {
    fontFamily: 'Helvetica-Bold',
  },
  tableCellSecondary: {
    fontSize: 8,
    color: colors.textSecondary,
  },
  // Column widths
  colAddress: { width: '28%' },
  colSubdivision: { width: '18%' },
  colPrice: { width: '14%', textAlign: 'right' },
  colPricePerSqft: { width: '10%', textAlign: 'right' },
  colBedBath: { width: '10%', textAlign: 'center' },
  colSqft: { width: '10%', textAlign: 'right' },
  colDate: { width: '10%', textAlign: 'right' },
  // Footer
  footer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 9,
    color: colors.textSecondary,
  },
  footerValue: {
    fontFamily: 'Helvetica-Bold',
    color: colors.textPrimary,
  },
  emptyMessage: {
    fontSize: 10,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
});

/**
 * Comps table component for displaying sale or rent comparables.
 * Only renders comps that are marked as included.
 */
export function PDFCompsTable({
  title,
  comps,
  calculatedValue,
  averagePricePerSqft,
  subjectSqft,
  type,
}: PDFCompsTableProps) {
  // Filter to only included comps
  const includedComps = comps.filter((comp) => comp.include);

  const valueLabel = type === 'rent' ? `${formatCurrency(calculatedValue)}/mo` : formatCurrency(calculatedValue);
  const dateHeader = type === 'rent' ? 'DOM' : 'Date';

  return (
    <View style={tableStyles.container} wrap={false}>
      {/* Header */}
      <View style={tableStyles.header}>
        <Text style={tableStyles.title}>{title}</Text>
        <Text style={tableStyles.calculatedValue}>{valueLabel}</Text>
      </View>

      <Text style={tableStyles.count}>
        {includedComps.length} comp{includedComps.length !== 1 ? 's' : ''} included
      </Text>

      {includedComps.length === 0 ? (
        <Text style={tableStyles.emptyMessage}>No comps included in calculations</Text>
      ) : (
        <>
          {/* Table Header */}
          <View style={tableStyles.tableHeader}>
            <Text style={[tableStyles.tableHeaderCell, tableStyles.colAddress]}>Address</Text>
            <Text style={[tableStyles.tableHeaderCell, tableStyles.colSubdivision]}>Subdivision</Text>
            <Text style={[tableStyles.tableHeaderCell, tableStyles.colPrice]}>
              {type === 'rent' ? 'Rent' : 'Sold'}
            </Text>
            <Text style={[tableStyles.tableHeaderCell, tableStyles.colPricePerSqft]}>$/Sqft</Text>
            <Text style={[tableStyles.tableHeaderCell, tableStyles.colBedBath]}>Bed/Bath</Text>
            <Text style={[tableStyles.tableHeaderCell, tableStyles.colSqft]}>Sqft</Text>
            <Text style={[tableStyles.tableHeaderCell, tableStyles.colDate]}>{dateHeader}</Text>
          </View>

          {/* Table Rows */}
          {includedComps.map((comp) => (
            <View key={comp.id} style={tableStyles.tableRow}>
              <View style={tableStyles.colAddress}>
                <Text style={[tableStyles.tableCell, tableStyles.tableCellBold]}>{comp.street}</Text>
                <Text style={tableStyles.tableCellSecondary}>
                  {comp.city}, {comp.state}
                </Text>
              </View>
              <Text style={[tableStyles.tableCell, tableStyles.colSubdivision]}>
                {comp.subdivision || '-'}
              </Text>
              <Text style={[tableStyles.tableCell, tableStyles.tableCellBold, tableStyles.colPrice]}>
                {formatCurrency(comp.priceSold)}
              </Text>
              <Text style={[tableStyles.tableCell, tableStyles.colPricePerSqft]}>
                ${type === 'rent' ? comp.pricePerSqft?.toFixed(2) : Math.round(comp.pricePerSqft)}
              </Text>
              <Text style={[tableStyles.tableCell, tableStyles.colBedBath]}>
                {comp.beds}/{comp.baths}
              </Text>
              <Text style={[tableStyles.tableCell, tableStyles.colSqft]}>
                {formatNumber(comp.sqft)}
              </Text>
              <Text style={[tableStyles.tableCell, tableStyles.colDate]}>
                {type === 'rent'
                  ? comp.daysOnMarket ?? '-'
                  : (comp as SaleComp).dateSold
                    ? new Date((comp as SaleComp).dateSold).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit',
                      })
                    : '-'}
              </Text>
            </View>
          ))}

          {/* Footer */}
          <View style={tableStyles.footer}>
            <Text style={tableStyles.footerText}>
              Avg $/Sqft:{' '}
              <Text style={tableStyles.tableCellBold}>
                ${type === 'rent' ? averagePricePerSqft?.toFixed(2) : Math.round(averagePricePerSqft)}
              </Text>
              {' × '}Subject Sqft: <Text style={tableStyles.tableCellBold}>{formatNumber(subjectSqft)}</Text>
              {' = '}
              <Text style={tableStyles.footerValue}>{valueLabel}</Text>
            </Text>
          </View>
        </>
      )}
    </View>
  );
}
