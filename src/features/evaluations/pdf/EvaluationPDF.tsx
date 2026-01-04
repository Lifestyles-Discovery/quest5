import { Document, Page } from '@react-pdf/renderer';
import { styles } from './styles';
import {
  PDFPageHeader,
  PDFPageFooter,
  PDFHeader,
  PDFPropertyAttributes,
  PDFCompsTable,
  PDFDealTerms,
  PDFCalculatorResults,
  PDFNotes,
} from './components';
import type { Evaluation } from '@app-types/evaluation.types';
import type { Property } from '@app-types/property.types';

interface EvaluationPDFProps {
  evaluation: Evaluation;
  property: Property;
}

/**
 * Main PDF document component for evaluation exports.
 * Composes all section components into a complete PDF document.
 */
export function EvaluationPDF({ evaluation, property }: EvaluationPDFProps) {
  const { saleCompGroup, rentCompGroup, calculator } = evaluation;
  const cityStateZip = `${property.city}, ${property.state} ${property.zip}`;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Fixed elements that appear on every page */}
        <PDFPageHeader address={property.address} cityStateZip={cityStateZip} />
        <PDFPageFooter />

        {/* First page hero header */}
        <PDFHeader
          address={property.address}
          city={property.city}
          state={property.state}
          zip={property.zip}
          scenarioName={evaluation.name}
        />

        {/* Property Attributes */}
        <PDFPropertyAttributes evaluation={evaluation} />

        {/* Sale Comps */}
        {saleCompGroup && (
          <PDFCompsTable
            title="Sale Comps"
            comps={saleCompGroup.saleComps || []}
            calculatedValue={saleCompGroup.calculatedValue || 0}
            averagePricePerSqft={saleCompGroup.averagePricePerSqft || 0}
            subjectSqft={evaluation.sqft || 0}
            type="sale"
          />
        )}

        {/* Rent Comps */}
        {rentCompGroup && (
          <PDFCompsTable
            title="Rent Comps"
            comps={rentCompGroup.rentComps || []}
            calculatedValue={rentCompGroup.calculatedValue || 0}
            averagePricePerSqft={rentCompGroup.averagePricePerSqft || 0}
            subjectSqft={evaluation.sqft || 0}
            type="rent"
          />
        )}

        {/* Deal Terms */}
        {calculator && <PDFDealTerms calculator={calculator} />}

        {/* Calculator Results */}
        {calculator && <PDFCalculatorResults calculator={calculator} />}

        {/* Notes */}
        <PDFNotes notes={evaluation.notes} />
      </Page>
    </Document>
  );
}
