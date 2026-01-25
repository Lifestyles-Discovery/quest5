import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import type { SaleComp, RentComp, SaleCompInputs, RentCompInputs } from '@app-types/evaluation.types';
import { PDFSearchCriteria } from './PDFSearchCriteria';

type CompType = 'sale' | 'rent';

interface SubjectProperty {
  sqft: number;
  beds: number;
  baths: number;
  garage: number;
  yearBuilt: number;
}

interface PDFCompsTableProps {
  title: string;
  comps: (SaleComp | RentComp)[];
  calculatedValue: number;
  averagePricePerSqft: number;
  subjectSqft: number;
  type: CompType;
  /** Optional search inputs to display above the comps table */
  searchInputs?: SaleCompInputs | RentCompInputs;
  /** Subject property values for calculating search ranges */
  subjectProperty?: SubjectProperty;
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
    marginTop: 2,
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
  tableRowExcluded: {
    backgroundColor: colors.backgroundMuted,
  },
  tableCell: {
    fontSize: 9,
    color: colors.textPrimary,
  },
  tableCellExcluded: {
    color: colors.textMuted,
    textDecoration: 'line-through',
  },
  tableCellBold: {
    fontFamily: 'Helvetica-Bold',
  },
  tableCellSecondary: {
    fontSize: 8,
    color: colors.textSecondary,
  },
  // Column widths (adjusted for 8 columns including Year)
  colAddress: { width: '24%' },
  colSubdivision: { width: '16%' },
  colPrice: { width: '12%', textAlign: 'right' },
  colPricePerSqft: { width: '10%', textAlign: 'right' },
  colBedBath: { width: '10%', textAlign: 'center' },
  colSqft: { width: '9%', textAlign: 'right' },
  colYear: { width: '8%', textAlign: 'right' },
  colDate: { width: '11%', textAlign: 'right' },
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
 * Shows all comps with excluded ones displayed in muted styling.
 */
export function PDFCompsTable({
  title,
  comps,
  calculatedValue,
  averagePricePerSqft,
  subjectSqft,
  type,
  searchInputs,
  subjectProperty,
}: PDFCompsTableProps) {
  // Show all comps, track included count for display
  const allComps = comps;
  const includedCount = comps.filter((comp) => comp.include).length;

  const valueLabel = type === 'rent' ? `${formatCurrency(calculatedValue)}/mo` : formatCurrency(calculatedValue);
  const dateHeader = type === 'rent' ? 'DOM' : 'Date';

  return (
    <View style={tableStyles.container} wrap={false}>
      {/* Search Criteria - render if provided */}
      {searchInputs && subjectProperty && (
        <PDFSearchCriteria inputs={searchInputs} subject={subjectProperty} />
      )}

      {/* Header */}
      <View style={tableStyles.header}>
        <View>
          <Text style={tableStyles.title}>{title}</Text>
          <Text style={tableStyles.count}>
            {includedCount} of {allComps.length} comp{allComps.length !== 1 ? 's' : ''} included
          </Text>
        </View>
        <Text style={tableStyles.calculatedValue}>{valueLabel}</Text>
      </View>

      {allComps.length === 0 ? (
        <Text style={tableStyles.emptyMessage}>No comps found</Text>
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
            <Text style={[tableStyles.tableHeaderCell, tableStyles.colBedBath]}>Bd/Ba/Gar</Text>
            <Text style={[tableStyles.tableHeaderCell, tableStyles.colSqft]}>Sqft</Text>
            <Text style={[tableStyles.tableHeaderCell, tableStyles.colYear]}>Year</Text>
            <Text style={[tableStyles.tableHeaderCell, tableStyles.colDate]}>{dateHeader}</Text>
          </View>

          {/* Table Rows */}
          {allComps.map((comp) => {
            const isExcluded = !comp.include;
            // Apply strikethrough inline to ensure it renders in react-pdf
            const excludedStyle = { color: colors.textMuted, textDecoration: 'line-through' as const };
            const cellStyle = isExcluded
              ? [tableStyles.tableCell, excludedStyle]
              : [tableStyles.tableCell];
            const boldCellStyle = isExcluded
              ? [tableStyles.tableCell, excludedStyle]
              : [tableStyles.tableCell, tableStyles.tableCellBold];
            const secondaryExcludedStyle = isExcluded
              ? [tableStyles.tableCellSecondary, excludedStyle]
              : tableStyles.tableCellSecondary;

            return (
              <View
                key={comp.id}
                style={[tableStyles.tableRow, isExcluded && tableStyles.tableRowExcluded]}
              >
                <View style={tableStyles.colAddress}>
                  <Text style={[...boldCellStyle]}>{comp.street}</Text>
                  <Text style={secondaryExcludedStyle}>
                    {comp.city}, {comp.state}
                  </Text>
                </View>
                <Text style={[...cellStyle, tableStyles.colSubdivision]}>
                  {comp.subdivision || '-'}
                </Text>
                <Text style={[...boldCellStyle, tableStyles.colPrice]}>
                  {formatCurrency(comp.priceSold)}
                </Text>
                <Text style={[...cellStyle, tableStyles.colPricePerSqft]}>
                  ${type === 'rent' ? comp.pricePerSqft?.toFixed(2) : Math.round(comp.pricePerSqft)}
                </Text>
                <Text style={[...cellStyle, tableStyles.colBedBath]}>
                  {comp.beds}/{comp.baths}/{comp.garage}
                </Text>
                <Text style={[...cellStyle, tableStyles.colSqft]}>
                  {formatNumber(comp.sqft)}
                </Text>
                <Text style={[...cellStyle, tableStyles.colYear]}>{comp.yearBuilt || '-'}</Text>
                <Text style={[...cellStyle, tableStyles.colDate]}>
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
            );
          })}

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
