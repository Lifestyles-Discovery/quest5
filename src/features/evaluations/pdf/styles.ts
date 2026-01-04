import { StyleSheet } from '@react-pdf/renderer';

/**
 * Color palette for PDF components
 */
export const colors = {
  // Text colors
  textPrimary: '#111827', // gray-900
  textSecondary: '#6b7280', // gray-500
  textMuted: '#9ca3af', // gray-400

  // Accent colors
  positive: '#16a34a', // green-600
  negative: '#dc2626', // red-600

  // Border colors
  border: '#e5e7eb', // gray-200
  borderLight: '#f3f4f6', // gray-100

  // Background colors
  background: '#ffffff',
  backgroundMuted: '#f9fafb', // gray-50
};

/**
 * Page dimensions and margins (Letter size: 8.5" x 11")
 */
export const pageLayout = {
  // Account for fixed header and footer
  paddingTop: 50, // Space for fixed header
  paddingBottom: 40, // Space for fixed footer
  paddingHorizontal: 40,
};

/**
 * Shared styles for PDF components
 */
export const styles = StyleSheet.create({
  // Page styles
  page: {
    backgroundColor: colors.background,
    paddingTop: pageLayout.paddingTop,
    paddingBottom: pageLayout.paddingBottom,
    paddingHorizontal: pageLayout.paddingHorizontal,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.textPrimary,
  },

  // Fixed header (appears on all pages)
  fixedHeader: {
    position: 'absolute',
    top: 15,
    left: pageLayout.paddingHorizontal,
    right: pageLayout.paddingHorizontal,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: 8,
  },

  fixedHeaderText: {
    fontSize: 8,
    color: colors.textMuted,
  },

  // Fixed footer (appears on all pages)
  fixedFooter: {
    position: 'absolute',
    bottom: 15,
    left: pageLayout.paddingHorizontal,
    right: pageLayout.paddingHorizontal,
    textAlign: 'center',
  },

  fixedFooterText: {
    fontSize: 8,
    color: colors.textMuted,
  },

  // Typography
  h1: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },

  h2: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },

  h3: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  body: {
    fontSize: 10,
    color: colors.textPrimary,
    lineHeight: 1.4,
  },

  bodySmall: {
    fontSize: 9,
    color: colors.textPrimary,
  },

  label: {
    fontSize: 8,
    color: colors.textSecondary,
    marginBottom: 2,
  },

  // Value displays
  valueLarge: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
  },

  valueMedium: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },

  valuePositive: {
    color: colors.positive,
  },

  valueNegative: {
    color: colors.negative,
  },

  // Sections
  section: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  // Grid layouts
  row: {
    flexDirection: 'row',
  },

  col2: {
    width: '50%',
  },

  col3: {
    width: '33.33%',
  },

  col4: {
    width: '25%',
  },

  col5: {
    width: '20%',
  },

  // Table styles
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
  },

  tableCell: {
    fontSize: 9,
  },

  tableCellRight: {
    textAlign: 'right',
  },

  tableCellCenter: {
    textAlign: 'center',
  },

  // Attribute grid
  attributeItem: {
    marginBottom: 8,
  },

  attributeLabel: {
    fontSize: 8,
    color: colors.textSecondary,
    marginBottom: 2,
  },

  attributeValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },

  // Two-column comparison layout
  comparisonContainer: {
    flexDirection: 'row',
    gap: 16,
  },

  comparisonColumn: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },

  comparisonHeader: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  // Metric row (label + value)
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  metricLabel: {
    fontSize: 9,
    color: colors.textSecondary,
  },

  metricValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },

  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginVertical: 8,
  },

  // Spacing utilities
  mt4: { marginTop: 4 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
});
