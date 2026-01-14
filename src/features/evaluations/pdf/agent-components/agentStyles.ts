import { StyleSheet } from '@react-pdf/renderer';

/**
 * Color palette for Agent PDF components
 */
export const agentColors = {
  // Text colors
  textPrimary: '#111827', // gray-900
  textSecondary: '#374151', // gray-700
  textMuted: '#6b7280', // gray-500

  // Accent colors
  positive: '#16a34a', // green-600
  negative: '#dc2626', // red-600

  // Border colors
  border: '#d1d5db', // gray-300
  borderLight: '#e5e7eb', // gray-200

  // Background colors
  background: '#ffffff',
};

/**
 * Page dimensions and margins (Letter size: 8.5" x 11")
 */
export const agentPageLayout = {
  paddingTop: 60, // Space for fixed header
  paddingBottom: 50, // Space for fixed footer
  paddingHorizontal: 50,
};

/**
 * Shared styles for Agent PDF components
 * Uses larger fonts for improved readability
 */
export const agentStyles = StyleSheet.create({
  // Page styles
  page: {
    backgroundColor: agentColors.background,
    paddingTop: agentPageLayout.paddingTop,
    paddingBottom: agentPageLayout.paddingBottom,
    paddingHorizontal: agentPageLayout.paddingHorizontal,
    fontFamily: 'Helvetica',
    fontSize: 12,
    color: agentColors.textPrimary,
  },

  // Fixed header (appears on all pages)
  fixedHeader: {
    position: 'absolute',
    top: 20,
    left: agentPageLayout.paddingHorizontal,
    right: agentPageLayout.paddingHorizontal,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: agentColors.borderLight,
    paddingBottom: 8,
  },

  fixedHeaderText: {
    fontSize: 10,
    color: agentColors.textMuted,
  },

  // Fixed footer with page numbers (appears on all pages)
  fixedFooter: {
    position: 'absolute',
    bottom: 20,
    left: agentPageLayout.paddingHorizontal,
    right: agentPageLayout.paddingHorizontal,
    textAlign: 'center',
  },

  fixedFooterText: {
    fontSize: 10,
    color: agentColors.textMuted,
  },

  // Main title header
  mainTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    color: agentColors.textPrimary,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: agentColors.textSecondary,
    marginBottom: 32,
  },

  // Section header
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: agentColors.textPrimary,
    marginTop: 24,
    marginBottom: 12,
  },

  // Table styles - simple two-column layout
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: agentColors.border,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: agentColors.background,
    borderBottomWidth: 1,
    borderBottomColor: agentColors.border,
  },

  tableHeaderCell: {
    padding: 10,
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: agentColors.textPrimary,
  },

  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: agentColors.borderLight,
  },

  tableRowLast: {
    flexDirection: 'row',
    // No bottom border for last row
  },

  tableCell: {
    padding: 10,
    fontSize: 14,
    color: agentColors.textPrimary,
  },

  tableCellLabel: {
    width: '60%',
    borderRightWidth: 1,
    borderRightColor: agentColors.borderLight,
  },

  tableCellValue: {
    width: '40%',
    textAlign: 'right',
  },

  tableCellValueBold: {
    fontFamily: 'Helvetica-Bold',
  },

  // Key metric display (large values)
  metricValue: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: agentColors.textPrimary,
  },

  metricValueSmall: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: agentColors.textPrimary,
  },

  metricLabel: {
    fontSize: 12,
    color: agentColors.textSecondary,
  },

  // Value colors
  valuePositive: {
    color: agentColors.positive,
  },

  valueNegative: {
    color: agentColors.negative,
  },

  // Spacing utilities
  mt8: { marginTop: 8 },
  mt16: { marginTop: 16 },
  mt24: { marginTop: 24 },
  mb8: { marginBottom: 8 },
  mb16: { marginBottom: 16 },
  mb24: { marginBottom: 24 },

  // Page break for separating scenarios
  pageBreak: {
    marginTop: 40,
  },
});
