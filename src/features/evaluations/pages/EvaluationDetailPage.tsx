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
import { Skeleton } from '@components/ui/skeleton/Skeleton';

function EvaluationPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb skeleton */}
      <nav className="flex items-center space-x-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-2" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-2" />
        <Skeleton className="h-4 w-16" />
      </nav>

      {/* Header skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Property Attributes skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Sale Comps skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
              <Skeleton className="h-16 w-24 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Rent Comps skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
              <Skeleton className="h-16 w-24 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Calculator skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
  // The Liberator API returns full evaluation objects (with saleCompGroup, rentCompGroup,
  // calculator) in the property.evaluations array.
  const {
    data: evaluation,
    isLoading,
    error,
  } = useQuery({
    queryKey: evaluationsKeys.detail(propertyId!, evaluationId!),
    queryFn: async () => {
      const prop = await propertiesService.getProperty(propertyId!);
      const eval_ = prop.evaluations?.find((e) => e.id === evaluationId);
      if (!eval_) {
        throw new Error('Evaluation not found');
      }
      return eval_;
    },
    enabled: !!propertyId && !!evaluationId,
    staleTime: 30000, // Consider fresh for 30 seconds
  });

  // Fetch search types for comp filters
  const { data: searchTypes } = useQuery({
    queryKey: evaluationsKeys.searchTypes(propertyId!, evaluationId!),
    queryFn: () => evaluationsService.getSearchTypes(propertyId!, evaluationId!),
    enabled: !!propertyId && !!evaluationId,
  });

  if (isLoading) {
    return <EvaluationPageSkeleton />;
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
          onClick={() => navigate(`/deals/${propertyId}`)}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Back to Deal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 print:hidden">
        <Link to="/deals" className="hover:text-primary">
          Deals
        </Link>
        <span>/</span>
        <Link to={`/deals/${propertyId}`} className="hover:text-primary">
          {property?.address || 'Deal'}
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">Scenario</span>
      </nav>

      {/* Header with actions */}
      <EvaluationHeader
        propertyId={propertyId!}
        evaluationId={evaluationId!}
        property={property}
        evaluation={evaluation}
      />

      {/* PDF Export Content Container */}
      <div id="evaluation-content" className="space-y-6">
        {/* Property Attributes (editable) */}
        <PropertyAttributes
          propertyId={propertyId!}
          evaluationId={evaluationId!}
          evaluation={evaluation}
        />

        {/* Comps sections */}
        <div className="space-y-6">
          {/* Sale Comps */}
          <SaleCompsSection
            propertyId={propertyId!}
            evaluationId={evaluationId!}
            evaluation={evaluation}
            searchTypes={searchTypes || []}
            subjectLatitude={property?.latitude}
            subjectLongitude={property?.longitude}
            subjectAddress={property?.address}
          />

          {/* Rent Comps */}
          <RentCompsSection
            propertyId={propertyId!}
            evaluationId={evaluationId!}
            evaluation={evaluation}
            searchTypes={searchTypes || []}
            subjectLatitude={property?.latitude}
            subjectLongitude={property?.longitude}
            subjectAddress={property?.address}
          />
        </div>

        {/* Calculator */}
        <CalculatorSection
          propertyId={propertyId!}
          evaluationId={evaluationId!}
          evaluation={evaluation}
        />

        {/* Notes */}
        <EvaluationNotes
          propertyId={propertyId!}
          evaluationId={evaluationId!}
          notes={evaluation.notes || ''}
        />
      </div>
    </div>
  );
}
