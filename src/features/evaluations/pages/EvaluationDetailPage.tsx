import { useParams, useNavigate, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { evaluationsKeys } from '@/hooks/api/useEvaluations';
import { propertiesKeys } from '@/hooks/api/useProperties';
import { evaluationsService } from '@services/evaluations.service';
import { propertiesService } from '@services/properties.service';
import PropertyAttributes from '../components/PropertyAttributes';
import SaleCompsSection from '../components/SaleCompsSection';
import RentCompsSection from '../components/RentCompsSection';
import CalculatorSection from '../components/CalculatorSection';
import EvaluationNotes from '../components/EvaluationNotes';
import EvaluationHeader from '../components/EvaluationHeader';

export default function EvaluationDetailPage() {
  const { propertyId, evaluationId } = useParams<{
    propertyId: string;
    evaluationId: string;
  }>();
  const navigate = useNavigate();

  // Fetch property for breadcrumb
  const { data: property } = useQuery({
    queryKey: propertiesKeys.detail(propertyId!),
    queryFn: () => propertiesService.getProperty(propertyId!),
    enabled: !!propertyId,
  });

  // Fetch evaluation
  const {
    data: evaluation,
    isLoading,
    error,
  } = useQuery({
    queryKey: evaluationsKeys.detail(propertyId!, evaluationId!),
    queryFn: async () => {
      // The evaluation is embedded in the property response
      const prop = await propertiesService.getProperty(propertyId!);
      const eval_ = prop.evaluations?.find((e) => e.id === evaluationId);
      if (!eval_) {
        throw new Error('Evaluation not found');
      }
      // For full evaluation data, we need to trigger a comp search or get cached data
      // The full evaluation with comps comes from the update endpoints
      return eval_ as unknown;
    },
    enabled: !!propertyId && !!evaluationId,
  });

  // Fetch search types for comp filters
  const { data: searchTypes } = useQuery({
    queryKey: evaluationsKeys.searchTypes(propertyId!, evaluationId!),
    queryFn: () => evaluationsService.getSearchTypes(propertyId!, evaluationId!),
    enabled: !!propertyId && !!evaluationId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
          Error Loading Evaluation
        </h3>
        <p className="mt-2 text-red-600 dark:text-red-300">
          {error instanceof Error ? error.message : 'Failed to load evaluation'}
        </p>
        <button
          onClick={() => navigate(`/properties/${propertyId}`)}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Back to Property
        </button>
      </div>
    );
  }

  // Type assertion for now - will be properly typed when we have full data
  const eval_ = evaluation as any;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/properties" className="hover:text-primary">
          Properties
        </Link>
        <span>/</span>
        <Link to={`/properties/${propertyId}`} className="hover:text-primary">
          {property?.address || 'Property'}
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">Evaluation</span>
      </nav>

      {/* Header with actions */}
      <EvaluationHeader
        propertyId={propertyId!}
        evaluationId={evaluationId!}
        property={property}
        evaluation={eval_}
      />

      {/* Property Attributes (editable) */}
      <PropertyAttributes
        propertyId={propertyId!}
        evaluationId={evaluationId!}
        evaluation={eval_}
      />

      {/* Comps sections */}
      <div className="space-y-6">
        {/* Sale Comps */}
        <SaleCompsSection
          propertyId={propertyId!}
          evaluationId={evaluationId!}
          evaluation={eval_}
          searchTypes={searchTypes || []}
        />

        {/* Rent Comps */}
        <RentCompsSection
          propertyId={propertyId!}
          evaluationId={evaluationId!}
          evaluation={eval_}
          searchTypes={searchTypes || []}
        />
      </div>

      {/* Calculator */}
      <CalculatorSection
        propertyId={propertyId!}
        evaluationId={evaluationId!}
        evaluation={eval_}
      />

      {/* Notes */}
      <EvaluationNotes
        propertyId={propertyId!}
        evaluationId={evaluationId!}
        notes={eval_.notes || ''}
      />
    </div>
  );
}
