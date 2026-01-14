import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { agentColors } from './agentStyles';

interface AgentPDFHeaderProps {
  scenarioType: 'conventional' | 'hardMoney';
  address: string;
  cityStateZip: string;
}

const headerStyles = StyleSheet.create({
  container: {
    marginBottom: 32,
    paddingTop: 8,
  },
  title: {
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
  },
});

/**
 * Main title header for a financing scenario section.
 * Shows "Investment Analysis" with financing type and address subtitle.
 */
export function AgentPDFHeader({ scenarioType, address, cityStateZip }: AgentPDFHeaderProps) {
  const scenarioLabel = scenarioType === 'hardMoney' ? 'Hard Money + Refinance' : 'Conventional';

  return (
    <View style={headerStyles.container} wrap={false}>
      <Text style={headerStyles.title}>Investment Analysis</Text>
      <Text style={headerStyles.subtitle}>
        {scenarioLabel} | {address}, {cityStateZip}
      </Text>
    </View>
  );
}
