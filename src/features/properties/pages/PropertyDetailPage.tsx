import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import PageMeta from '@components/common/PageMeta';
import Alert from '@components/ui/alert/Alert';
import Button from '@components/ui/button/Button';
import { useProperty, useUpdatePropertyStage } from '@hooks/api/useProperties';
import {
  useDeleteEvaluation,
  useExportPdf,
  useShareEvaluation,
  evaluationsKeys,
} from '@hooks/api/useEvaluations';
import { propertiesService } from '@services/properties.service';
import { PROPERTY_STAGES, type PropertyStage } from '@app-types/property.types';
import EvaluationContent from '@/features/evaluations/components/EvaluationContent';
import { ScenarioHistory } from '../components/ScenarioHistory';
import { Skeleton } from '@components/ui/skeleton/Skeleton';
import PhotoGallery from '@components/common/PhotoGallery';

function PropertyDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-7 w-48" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Header card skeleton */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Photo skeleton */}
          <Skeleton className="h-64 w-full lg:h-full" />

          {/* Details skeleton */}
          <div className="col-span-2 p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-48" />
              </div>
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>

            {/* Action buttons skeleton */}
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation content skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="space-y-6">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional section skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

export default function PropertyDetailPage() {
  const { id, scenarioId } = useParams<{ id: string; scenarioId?: string }>();
  const navigate = useNavigate();

  // State for modals
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showGallery, setShowGallery] = useState(false);

  // Hooks
  const { data: property, isLoading: propertyLoading, error: propertyError } = useProperty(id!);
  const updateStage = useUpdatePropertyStage();
  const deleteEvaluation = useDeleteEvaluation();
  const exportPdf = useExportPdf();
  const shareEvaluation = useShareEvaluation();

  // Determine which evaluation to show
  const currentEvaluationId = scenarioId || property?.evaluations?.[0]?.id;

  // Fetch full evaluation data when we have an evaluation ID
  // The Liberator API returns full evaluation objects (with saleCompGroup, rentCompGroup,
  // calculator) in the property.evaluations array, so we can use that data directly.
  const {
    data: evaluation,
    isLoading: evaluationLoading,
    error: evaluationError,
  } = useQuery({
    queryKey: evaluationsKeys.detail(id!, currentEvaluationId!),
    queryFn: async () => {
      const prop = await propertiesService.getProperty(id!);
      const eval_ = prop.evaluations?.find((e) => e.id === currentEvaluationId);
      if (!eval_) {
        throw new Error('Evaluation not found');
      }
      return eval_;
    },
    enabled: !!id && !!currentEvaluationId,
    // Use cached data without refetching too frequently
    staleTime: 30000, // Consider fresh for 30 seconds
  });

  // Update URL to include scenarioId if not present but evaluation exists
  useEffect(() => {
    if (property && currentEvaluationId && !scenarioId) {
      navigate(`/deals/${id}/scenario/${currentEvaluationId}`, { replace: true });
    }
  }, [property, currentEvaluationId, scenarioId, id, navigate]);

  // Handlers
  const handleStageChange = (newStage: PropertyStage) => {
    if (!property) return;
    updateStage.mutate({ propertyId: property.id, stage: newStage });
  };

  const handleScenarioSelect = (evaluationId: string) => {
    navigate(`/deals/${id}/scenario/${evaluationId}`);
  };

  const handleExportPdf = () => {
    if (!currentEvaluationId) return;
    exportPdf.mutate(
      { propertyId: id!, evaluationId: currentEvaluationId },
      {
        onSuccess: ({ url }) => {
          window.open(url, '_blank');
        },
      }
    );
  };

  const handleShare = () => {
    if (!currentEvaluationId) return;
    shareEvaluation.mutate(
      { propertyId: id!, evaluationId: currentEvaluationId },
      {
        onSuccess: (data) => {
          setShareUrl(data.shareUrl);
          setShowShareModal(true);
        },
      }
    );
  };

  const handleDelete = () => {
    if (!currentEvaluationId || !property) return;

    // If this is the only evaluation, just close modal - can't delete
    if (property.evaluations?.length === 1) {
      setShowDeleteConfirm(false);
      return;
    }

    deleteEvaluation.mutate(
      { propertyId: id!, evaluationId: currentEvaluationId },
      {
        onSuccess: () => {
          setShowDeleteConfirm(false);
          // Navigate to first remaining evaluation
          const remaining = property.evaluations?.find((e) => e.id !== currentEvaluationId);
          if (remaining) {
            navigate(`/deals/${id}/scenario/${remaining.id}`, { replace: true });
          } else {
            navigate(`/deals/${id}`, { replace: true });
          }
        },
      }
    );
  };

  // Loading state
  if (propertyLoading) {
    return <PropertyDetailSkeleton />;
  }

  // Error state
  if (propertyError || !property) {
    return (
      <div className="py-12">
        <Alert
          variant="error"
          title="Error loading deal"
          message="Could not load deal details. Please try again."
        />
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/deals')}>
            Back to Deals
          </Button>
        </div>
      </div>
    );
  }

  const fullAddress = `${property.address}, ${property.city}, ${property.state} ${property.zip}`;
  const primaryPhoto = property.photoUrl || '/images/cards/card-01.jpg';

  // Check if there's any secondary content to show
  const hasNotes = property.notes && property.notes.length > 0;
  const hasDocuments = property.documents && property.documents.length > 0;
  const hasConnections = property.connections && property.connections.length > 0;
  const hasSecondaryContent = hasNotes || hasDocuments || hasConnections;

  // Determine if we should auto-expand secondary content based on stage
  const shouldExpandSecondary = ['Negotiating', 'Diligence', 'Closing'].includes(property.stage);

  return (
    <>
      <PageMeta
        title={`${property.address} | Quest`}
        description={`Property details for ${fullAddress}`}
      />

      {/* Breadcrumb */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {property.address}
        </h2>
        <nav>
          <ol className="flex items-center gap-1.5">
            <li>
              <Link
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
                to="/deals"
              >
                Deals
                <svg
                  className="stroke-current"
                  width="17"
                  height="16"
                  viewBox="0 0 17 16"
                  fill="none"
                >
                  <path
                    d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </li>
            <li className="text-sm text-gray-800 dark:text-white/90">{property.address}</li>
          </ol>
        </nav>
      </div>

      <div className="space-y-6">
        {/* Property Header Card */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Photo */}
            <div className="relative h-64 lg:h-auto">
              {property.photoUrls && property.photoUrls.length > 0 ? (
                <button
                  onClick={() => setShowGallery(true)}
                  className="h-full w-full cursor-pointer"
                >
                  <img
                    src={primaryPhoto}
                    alt={property.address}
                    className="h-full w-full object-cover hover:opacity-95"
                  />
                  {property.photoUrls.length > 1 && (
                    <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                      +{property.photoUrls.length - 1} photos
                    </div>
                  )}
                </button>
              ) : (
                <img
                  src={primaryPhoto}
                  alt={property.address}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            {/* Details */}
            <div className="col-span-2 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    {property.address}
                  </h1>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">
                    {property.city}, {property.state} {property.zip}
                  </p>
                </div>

                {/* Stage Selector - only show for non-archived deals */}
                {property.stage !== 'Inactive' && (
                  <select
                    value={property.stage}
                    onChange={(e) => handleStageChange(e.target.value as PropertyStage)}
                    disabled={updateStage.isPending}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    {PROPERTY_STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                )}

                {/* Archived Badge - show for archived deals */}
                {property.stage === 'Inactive' && (
                  <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    Archived
                  </span>
                )}
              </div>

              {/* Archived Banner with Unarchive button */}
              {property.stage === 'Inactive' && (
                <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-100 px-4 py-3 dark:bg-gray-800">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    This deal is archived
                  </div>
                  <button
                    onClick={() => handleStageChange('Finding')}
                    disabled={updateStage.isPending}
                    className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    {updateStage.isPending ? 'Restoring...' : 'Unarchive'}
                  </button>
                </div>
              )}

              {/* Actions Row */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={handleExportPdf}
                  disabled={exportPdf.isPending || !currentEvaluationId}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {exportPdf.isPending ? 'Generating...' : 'Export PDF'}
                </button>

                <button
                  onClick={handleShare}
                  disabled={shareEvaluation.isPending || !currentEvaluationId}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  {shareEvaluation.isPending ? 'Sharing...' : 'Share'}
                </button>

                {property.evaluations && property.evaluations.length > 1 && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete Scenario
                  </button>
                )}

                {/* Archive Button - only show for non-archived deals */}
                {property.stage !== 'Inactive' && (
                  <button
                    onClick={() => handleStageChange('Inactive')}
                    disabled={updateStage.isPending}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Archive
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Content */}
        {evaluationLoading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="space-y-6">
              <Skeleton className="h-6 w-40" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : evaluationError || !evaluation ? (
          <Alert
            variant="error"
            title="Error loading evaluation"
            message="Could not load evaluation data. Please try again."
          />
        ) : (
          <EvaluationContent
            propertyId={id!}
            evaluationId={currentEvaluationId!}
            evaluation={evaluation}
            subjectLatitude={property.latitude}
            subjectLongitude={property.longitude}
            subjectAddress={property.address}
          />
        )}

        {/* Scenario History */}
        {property && currentEvaluationId && (
          <ScenarioHistory
            property={property}
            currentEvaluationId={currentEvaluationId}
            onScenarioSelect={handleScenarioSelect}
          />
        )}

        {/* Secondary Content - Collapsible */}
        {hasSecondaryContent && (
          <details
            className="group rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
            open={shouldExpandSecondary}
          >
            <summary className="cursor-pointer list-none px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">
                  More Details
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    {[
                      hasNotes && `${property.notes!.length} notes`,
                      hasDocuments && `${property.documents!.length} docs`,
                      hasConnections && `${property.connections!.length} contacts`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </h3>
                <svg
                  className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </summary>
            <div className="space-y-6 border-t border-gray-200 p-6 dark:border-gray-800">
              {/* Notes */}
              {hasNotes && (
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notes ({property.notes!.length})
                  </h4>
                  <div className="space-y-3">
                    {property.notes!.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(note.createdUtc)}
                          </span>
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            {note.stage === 'Inactive' ? 'Archived' : note.stage}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 dark:text-white/90">{note.theNote}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {hasDocuments && (
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Documents ({property.documents!.length})
                  </h4>
                  <div className="space-y-3">
                    {property.documents!.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded bg-gray-100 p-2 dark:bg-gray-800">
                            <svg
                              className="h-5 w-5 text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">{doc.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {doc.type} · {(doc.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(doc.uploadedUtc)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Connections */}
              {hasConnections && (
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Connections ({property.connections!.length})
                  </h4>
                  <div className="space-y-3">
                    {property.connections!.map((connection) => (
                      <div
                        key={connection.id}
                        className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">
                              {connection.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {connection.type}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {connection.email && <p>{connection.email}</p>}
                          {connection.phone && <p>{connection.phone}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Scenario?
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              This action cannot be undone. All comp data and calculations for this scenario will be
              permanently deleted.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteEvaluation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteEvaluation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Share Evaluation
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Copy this link to share the evaluation:
            </p>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                }}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Copy
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Gallery */}
      {showGallery && property.photoUrls && property.photoUrls.length > 0 && (
        <PhotoGallery
          photos={property.photoUrls}
          onClose={() => setShowGallery(false)}
        />
      )}
    </>
  );
}
