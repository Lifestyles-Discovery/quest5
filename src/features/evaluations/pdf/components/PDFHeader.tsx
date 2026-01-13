import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles';

interface PDFHeaderProps {
  address: string;
  city: string;
  state: string;
  zip: string;
  scenarioName?: string;
  created?: string;
  lastUpdate?: string;
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
 * Shows property address, location, scenario name, and created/updated dates.
 */
export function PDFHeader({ address, city, state, zip, scenarioName, created, lastUpdate }: PDFHeaderProps) {
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const createdDate = formatDate(created);
  const updatedDate = formatDate(lastUpdate);

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
        <View>
          {createdDate && <Text style={headerStyles.date}>Created: {createdDate}</Text>}
          {updatedDate && <Text style={headerStyles.date}>Last Update: {updatedDate}</Text>}
        </View>
      </View>
    </View>
  );
}
