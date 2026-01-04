import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles';

interface PDFHeaderProps {
  address: string;
  city: string;
  state: string;
  zip: string;
  scenarioName?: string;
}

const headerStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  address: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  scenarioName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.textSecondary,
  },
  date: {
    fontSize: 9,
    color: colors.textMuted,
  },
});

/**
 * Hero header section for the first page of the PDF.
 * Shows property address, location, scenario name, and generation date.
 */
export function PDFHeader({ address, city, state, zip, scenarioName }: PDFHeaderProps) {
  const generatedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={headerStyles.container}>
      <Text style={headerStyles.address}>{address}</Text>
      <Text style={headerStyles.location}>
        {city}, {state} {zip}
      </Text>
      <View style={headerStyles.metaRow}>
        {scenarioName ? (
          <Text style={headerStyles.scenarioName}>{scenarioName}</Text>
        ) : (
          <Text style={headerStyles.scenarioName}> </Text>
        )}
        <Text style={headerStyles.date}>{generatedDate}</Text>
      </View>
    </View>
  );
}
