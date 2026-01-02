import { useQuery } from '@tanstack/react-query';
import { evaluationsKeys } from '@/hooks/api/useEvaluations';
import { evaluationsService } from '@services/evaluations.service';
import type { Evaluation } from '@app-types/evaluation.types';
import PropertyAttributes from './PropertyAttributes';
import SaleCompsSection from './SaleCompsSection';
import RentCompsSection from './RentCompsSection';
import CalculatorSection from './CalculatorSection';
import EvaluationNotes from './EvaluationNotes';

interface EvaluationContentProps {
  propertyId: string;
  evaluationId: string;
  evaluation: Evaluation;
  subjectLatitude?: number;
  subjectLongitude?: number;
  subjectAddress?: string;
}

/**
 * EvaluationContent - The core evaluation UI extracted for reuse.
 *
 * This component renders the full evaluation interface:
 * - Property attributes (editable)
 * - Sale comps section
 * - Rent comps section
 * - Calculator section
 * - Notes section
 *
 * Used by the merged PropertyDetailPage to display evaluation data inline.
 */
export default function EvaluationContent({
  propertyId,
  evaluationId,
  evaluation,
  subjectLatitude,
  subjectLongitude,
  subjectAddress,
}: EvaluationContentProps) {
  // Fetch search types for comp filters
  const { data: searchTypes } = useQuery({
    queryKey: evaluationsKeys.searchTypes(propertyId, evaluationId),
    queryFn: () => evaluationsService.getSearchTypes(propertyId, evaluationId),
    enabled: !!propertyId && !!evaluationId,
  });

  return (
    <div id="evaluation-content" className="space-y-6">
      {/* Property Attributes (editable) */}
      <PropertyAttributes
        propertyId={propertyId}
        evaluationId={evaluationId}
        evaluation={evaluation}
      />

      {/* Comps sections */}
      <div className="space-y-6">
        {/* Sale Comps */}
        <SaleCompsSection
          propertyId={propertyId}
          evaluationId={evaluationId}
          evaluation={evaluation}
          searchTypes={searchTypes || []}
          subjectLatitude={subjectLatitude}
          subjectLongitude={subjectLongitude}
          subjectAddress={subjectAddress}
        />

        {/* Rent Comps */}
        <RentCompsSection
          propertyId={propertyId}
          evaluationId={evaluationId}
          evaluation={evaluation}
          searchTypes={searchTypes || []}
          subjectLatitude={subjectLatitude}
          subjectLongitude={subjectLongitude}
          subjectAddress={subjectAddress}
        />
      </div>

      {/* Calculator */}
      <CalculatorSection
        propertyId={propertyId}
        evaluationId={evaluationId}
        evaluation={evaluation}
      />

      {/* Notes */}
      <EvaluationNotes
        propertyId={propertyId}
        evaluationId={evaluationId}
        notes={evaluation.notes || ''}
      />
    </div>
  );
}
