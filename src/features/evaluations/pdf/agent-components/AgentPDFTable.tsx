import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { agentColors } from './agentStyles';

export interface TableRow {
  label: string;
  value: string;
  isBold?: boolean;
  isTotal?: boolean;
  valueColor?: 'positive' | 'negative' | 'default';
}

interface AgentPDFTableProps {
  title: string;
  rows: TableRow[];
  showHeader?: boolean;
  headerLabels?: { label: string; value: string };
}

const tableStyles = StyleSheet.create({
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
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb', // gray-50
    borderBottomWidth: 1,
    borderBottomColor: agentColors.border,
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
    width: '60%',
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: agentColors.borderLight,
  },
  cellValue: {
    width: '40%',
    padding: 10,
    textAlign: 'right',
  },
  textNormal: {
    fontSize: 14,
    color: agentColors.textPrimary,
  },
  textBold: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: agentColors.textPrimary,
  },
  textHeader: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: agentColors.textPrimary,
  },
  textPositive: {
    color: agentColors.positive,
  },
  textNegative: {
    color: agentColors.negative,
  },
});

/**
 * Reusable simple two-column table for Agent PDF.
 * Displays data in Item | Amount format with clean borders.
 */
export function AgentPDFTable({
  title,
  rows,
  showHeader = true,
  headerLabels = { label: 'Item', value: 'Amount' },
}: AgentPDFTableProps) {
  const getValueStyle = (row: TableRow) => {
    const baseStyle = row.isBold || row.isTotal ? tableStyles.textBold : tableStyles.textNormal;

    if (row.valueColor === 'positive') {
      return [baseStyle, tableStyles.textPositive];
    }
    if (row.valueColor === 'negative') {
      return [baseStyle, tableStyles.textNegative];
    }
    return baseStyle;
  };

  return (
    <View style={tableStyles.container} wrap={false}>
      <Text style={tableStyles.title}>{title}</Text>
      <View style={tableStyles.table}>
        {showHeader && (
          <View style={tableStyles.headerRow}>
            <View style={tableStyles.cellLabel}>
              <Text style={tableStyles.textHeader}>{headerLabels.label}</Text>
            </View>
            <View style={tableStyles.cellValue}>
              <Text style={tableStyles.textHeader}>{headerLabels.value}</Text>
            </View>
          </View>
        )}
        {rows.map((row, index) => {
          const isLast = index === rows.length - 1;
          const rowStyle = isLast ? tableStyles.rowLast : tableStyles.row;
          const labelStyle = row.isBold || row.isTotal ? tableStyles.textBold : tableStyles.textNormal;

          return (
            <View key={index} style={rowStyle}>
              <View style={tableStyles.cellLabel}>
                <Text style={labelStyle}>{row.label}</Text>
              </View>
              <View style={tableStyles.cellValue}>
                <Text style={getValueStyle(row)}>{row.value}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
