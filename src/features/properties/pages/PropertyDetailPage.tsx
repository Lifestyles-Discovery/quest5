import { useParams, useNavigate, Link } from 'react-router';
import PageMeta from '@components/common/PageMeta';
import Button from '@components/ui/button/Button';
import Alert from '@components/ui/alert/Alert';
import { useProperty, useUpdatePropertyStage } from '@hooks/api/useProperties';
import { useCreateEvaluation } from '@hooks/api/useEvaluations';
import { PROPERTY_STAGES, type PropertyStage } from '@app-types/property.types';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: property, isLoading, error } = useProperty(id!);
  const updateStage = useUpdatePropertyStage();
  const createEvaluation = useCreateEvaluation();

  const handleStageChange = (newStage: PropertyStage) => {
    if (!property) return;
    updateStage.mutate({ propertyId: property.id, stage: newStage });
  };

  const handleCreateEvaluation = () => {
    if (!property) return;
    createEvaluation.mutate(property.id, {
      onSuccess: (newEval) => {
        navigate(`/properties/${property.id}/evaluations/${newEval.id}`);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="py-12">
        <Alert
          variant="error"
          title="Error loading property"
          message="Could not load property details. Please try again."
        />
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/properties')}>
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  const fullAddress = `${property.address}, ${property.city}, ${property.state} ${property.zip}`;
  const primaryPhoto = property.photoUrl || '/images/cards/card-01.jpg';
  const latestEvaluation = property.evaluations?.[0];

  // Check if there's any secondary content to show
  const hasNotes = property.notes && property.notes.length > 0;
  const hasDocuments = property.documents && property.documents.length > 0;
  const hasConnections = property.connections && property.connections.length > 0;
  const hasSecondaryContent = hasNotes || hasDocuments || hasConnections;

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
                to="/properties"
              >
                Properties
                <svg className="stroke-current" width="17" height="16" viewBox="0 0 17 16" fill="none">
                  <path d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </li>
            <li className="text-sm text-gray-800 dark:text-white/90">
              {property.address}
            </li>
          </ol>
        </nav>
      </div>

      <div className="space-y-6">
        {/* Property Header Card */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Photo */}
            <div className="relative h-64 lg:h-auto">
              <img
                src={primaryPhoto}
                alt={property.address}
                className="h-full w-full object-cover"
              />
              {property.photoUrls && property.photoUrls.length > 1 && (
                <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                  +{property.photoUrls.length - 1} photos
                </div>
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

                {/* Stage + New Evaluation */}
                <div className="flex items-center gap-3">
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
                  <button
                    onClick={handleCreateEvaluation}
                    disabled={createEvaluation.isPending}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {createEvaluation.isPending ? 'Creating...' : 'New Evaluation'}
                  </button>
                </div>
              </div>

              {/* Property Stats from latest evaluation */}
              {latestEvaluation ? (
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Beds</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      {latestEvaluation.beds ?? '—'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Baths</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      {latestEvaluation.baths ?? '—'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sq Ft</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      {latestEvaluation.sqft?.toLocaleString() ?? '—'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Year Built</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      {latestEvaluation.yearBuilt ?? '—'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No evaluations yet. Create an evaluation to see property details.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Evaluations Section - Always Visible (Hero) */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">
              Evaluations
              {property.evaluations && property.evaluations.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({property.evaluations.length})
                </span>
              )}
            </h3>
          </div>
          <div className="p-6">
            {!property.evaluations?.length ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="mb-1 text-lg font-medium text-gray-800 dark:text-white/90">
                  No Evaluations Yet
                </h4>
                <p className="mb-4 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                  Create an evaluation to analyze sale comps, rent comps, and investment returns.
                </p>
                <button
                  onClick={handleCreateEvaluation}
                  disabled={createEvaluation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {createEvaluation.isPending ? 'Creating...' : 'Create First Evaluation'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {property.evaluations.map((evaluation) => (
                  <Link
                    key={evaluation.id}
                    to={`/properties/${property.id}/evaluations/${evaluation.id}`}
                    className="block rounded-lg border border-gray-200 p-4 transition-colors hover:border-brand-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-brand-600 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {evaluation.beds} bed / {evaluation.baths} bath / {evaluation.sqft?.toLocaleString()} sqft
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Created {new Date(evaluation.createdUtc).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {evaluation.listPrice && (
                          <p className="font-semibold text-gray-800 dark:text-white">
                            ${evaluation.listPrice.toLocaleString()}
                          </p>
                        )}
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    {evaluation.notes && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                        {evaluation.notes}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Secondary Content - Collapsible (only shown if content exists) */}
        {hasSecondaryContent && (
          <details className="group rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <summary className="cursor-pointer list-none px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">
                  More Details
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    {[
                      hasNotes && `${property.notes!.length} notes`,
                      hasDocuments && `${property.documents!.length} docs`,
                      hasConnections && `${property.connections!.length} contacts`,
                    ].filter(Boolean).join(' · ')}
                  </span>
                </h3>
                <svg
                  className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                            {new Date(note.createdUtc).toLocaleDateString()}
                          </span>
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            {note.stage}
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
                            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
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
                          {new Date(doc.uploadedUtc).toLocaleDateString()}
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
                            <p className="font-medium text-gray-800 dark:text-white">{connection.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{connection.type}</p>
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
    </>
  );
}
