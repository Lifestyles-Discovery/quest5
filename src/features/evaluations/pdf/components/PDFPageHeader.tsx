import { View, Text } from '@react-pdf/renderer';
import { styles } from '../styles';

interface PDFPageHeaderProps {
  address: string;
  cityStateZip: string;
}

/**
 * Fixed header that appears on every page of the PDF.
 * Shows the property address in a subtle style.
 */
export function PDFPageHeader({ address, cityStateZip }: PDFPageHeaderProps) {
  return (
    <View style={styles.fixedHeader} fixed>
      <Text style={styles.fixedHeaderText}>
        {address}, {cityStateZip}
      </Text>
    </View>
  );
}
