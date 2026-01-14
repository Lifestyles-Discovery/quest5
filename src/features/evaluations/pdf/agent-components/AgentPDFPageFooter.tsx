import { View, Text } from '@react-pdf/renderer';
import { agentStyles } from './agentStyles';

/**
 * Fixed footer that appears on every page of the Agent PDF.
 * Shows page numbers in "Page X of Y" format.
 */
export function AgentPDFPageFooter() {
  return (
    <View style={agentStyles.fixedFooter} fixed>
      <Text
        style={agentStyles.fixedFooterText}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  );
}
