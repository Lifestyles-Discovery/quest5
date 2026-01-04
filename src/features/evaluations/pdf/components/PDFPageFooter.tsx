import { View, Text } from '@react-pdf/renderer';
import { styles } from '../styles';

/**
 * Fixed footer that appears on every page of the PDF.
 * Shows page numbers in "Page X of Y" format.
 */
export function PDFPageFooter() {
  return (
    <View style={styles.fixedFooter} fixed>
      <Text
        style={styles.fixedFooterText}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  );
}
