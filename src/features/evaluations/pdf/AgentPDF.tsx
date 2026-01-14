import { Document, Page, View } from '@react-pdf/renderer';
import {
  agentStyles,
  AgentPDFPageHeader,
  AgentPDFPageFooter,
  AgentPDFHeader,
  AgentPDFPerformanceSummary,
  AgentPDFCashOutOfPocket,
  AgentPDFMonthlyCashFlow,
  AgentPDFLoanTerms,
} from './agent-components';
import type { Evaluation } from '@app-types/evaluation.types';
import type { Property } from '@app-types/property.types';

interface AgentPDFProps {
  evaluation: Evaluation;
  property: Property;
}

interface ScenarioSectionProps {
  evaluation: Evaluation;
  property: Property;
  scenarioType: 'conventional' | 'hardMoney';
  cityStateZip: string;
}

/**
 * Single scenario section containing all tables for that financing type.
 */
function ScenarioSection({
  evaluation,
  property,
  scenarioType,
  cityStateZip,
}: ScenarioSectionProps) {
  const { calculator } = evaluation;

  return (
    <View>
      <AgentPDFHeader
        scenarioType={scenarioType}
        address={property.address}
        cityStateZip={cityStateZip}
      />
      <AgentPDFPerformanceSummary calculator={calculator} scenarioType={scenarioType} />
      <AgentPDFCashOutOfPocket calculator={calculator} scenarioType={scenarioType} />
      <AgentPDFMonthlyCashFlow calculator={calculator} scenarioType={scenarioType} />
      <AgentPDFLoanTerms calculator={calculator} scenarioType={scenarioType} />
    </View>
  );
}

/**
 * Agent PDF document component.
 * Produces a clean, readable investment analysis document with simple table layouts.
 * Shows enabled financing scenarios based on calculator.conventionalInputs.show
 * and calculator.hardMoneyInputs.show flags.
 */
export function AgentPDF({ evaluation, property }: AgentPDFProps) {
  const { calculator } = evaluation;
  const cityStateZip = `${property.city}, ${property.state} ${property.zip}`;

  const showConventional = calculator?.conventionalInputs?.show;
  const showHardMoney = calculator?.hardMoneyInputs?.show;

  // Determine which scenarios to render
  const scenarios: ('conventional' | 'hardMoney')[] = [];
  if (showHardMoney) scenarios.push('hardMoney');
  if (showConventional) scenarios.push('conventional');

  return (
    <Document>
      <Page size="LETTER" style={agentStyles.page}>
        {/* Fixed elements that appear on every page */}
        <AgentPDFPageHeader address={property.address} cityStateZip={cityStateZip} />
        <AgentPDFPageFooter />

        {/* Render each enabled scenario */}
        {scenarios.map((scenarioType, index) => (
          <View key={scenarioType} break={index > 0}>
            <ScenarioSection
              evaluation={evaluation}
              property={property}
              scenarioType={scenarioType}
              cityStateZip={cityStateZip}
            />
          </View>
        ))}

        {/* If no scenarios enabled, show header only */}
        {scenarios.length === 0 && (
          <View style={{ padding: 40 }}>
            <AgentPDFHeader
              scenarioType="conventional"
              address={property.address}
              cityStateZip={cityStateZip}
            />
          </View>
        )}
      </Page>
    </Document>
  );
}
