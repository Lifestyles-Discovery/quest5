import { View, Text } from '@react-pdf/renderer';
import { agentStyles } from './agentStyles';

interface AgentPDFPageHeaderProps {
  address: string;
  cityStateZip: string;
}

/**
 * Fixed header that appears on every page of the Agent PDF.
 * Shows the property address.
 */
export function AgentPDFPageHeader({ address, cityStateZip }: AgentPDFPageHeaderProps) {
  return (
    <View style={agentStyles.fixedHeader} fixed>
      <Text style={agentStyles.fixedHeaderText}>
        {address}, {cityStateZip}
      </Text>
    </View>
  );
}
