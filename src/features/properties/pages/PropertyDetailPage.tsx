import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import PageMeta from '@components/common/PageMeta';
import Button from '@components/ui/button/Button';
import Alert from '@components/ui/alert/Alert';
import { useProperty, useUpdatePropertyStage } from '@hooks/api/useProperties';
import { useCreateEvaluation } from '@hooks/api/useEvaluations';
import { PROPERTY_STAGES, type PropertyStage } from '@app-types/property.types';

type TabId = 'overview' | 'evaluations' | 'connections' | 'notes' | 'documents';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'evaluations', label: 'Evaluations' },
  { id: 'connections', label: 'Connections' },
  { id: 'notes', label: 'Notes' },
  { id: 'documents', label: 'Documents' },
];

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const { data: property, isLoading, error } = useProperty(id!);
  const updateStage = useUpdatePropertyStage();

  const handleStageChange = (newStage: PropertyStage) => {
    if (!property) return;
    updateStage.mutate({ propertyId: property.id, stage: newStage });
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

  return (
    <>
      <PageMeta
        title={`${property.address} | Quest`}
        description={`Property details for ${fullAddress}`}
      />

      {/* Custom Breadcrumb with back link */}
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
                <svg
                  className="stroke-current"
                  width="17"
                  height="16"
                  viewBox="0 0 17 16"
                  fill="none"
                >
                  <path
                    d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                    stroke=""
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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
        {/* Property Header */}
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
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    {property.address}
                  </h1>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">
                    {property.city}, {property.state} {property.zip}
                  </p>
                </div>

                {/* Stage Dropdown */}
                <div>
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

              {/* Counts */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>{property.evaluationCount} evaluations</span>
                <span>{property.connectionCount} connections</span>
                <span>{property.noteCount} notes</span>
                <span>{property.documentCount} documents</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 px-6 dark:border-gray-800">
            <nav className="-mb-px flex space-x-2 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-brand-500 text-brand-500 dark:border-brand-400 dark:text-brand-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTab property={property} />
            )}
            {activeTab === 'evaluations' && (
              <EvaluationsTab property={property} />
            )}
            {activeTab === 'connections' && (
              <ConnectionsTab property={property} />
            )}
            {activeTab === 'notes' && (
              <NotesTab property={property} />
            )}
            {activeTab === 'documents' && (
              <DocumentsTab property={property} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

type PropertyType = NonNullable<ReturnType<typeof useProperty>['data']>;

function OverviewTab({ property }: { property: PropertyType }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-lg font-medium text-gray-800 dark:text-white/90">
          Property Details
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="Address" value={property.address} />
          <DetailItem label="City" value={property.city} />
          <DetailItem label="State" value={property.state} />
          <DetailItem label="ZIP Code" value={property.zip} />
          <DetailItem label="Property Type" value={property.propertyType} />
          <DetailItem label="Stage" value={property.stage} />
        </div>
      </div>

      {property.latitude && property.longitude && (
        <div>
          <h3 className="mb-3 text-lg font-medium text-gray-800 dark:text-white/90">
            Location
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem label="Latitude" value={property.latitude.toString()} />
            <DetailItem label="Longitude" value={property.longitude.toString()} />
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-lg font-medium text-gray-800 dark:text-white/90">
          Timeline
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailItem
            label="Last Updated"
            value={property.lastUpdate ? new Date(property.lastUpdate).toLocaleDateString() : undefined}
          />
        </div>
      </div>
    </div>
  );
}

function EvaluationsTab({ property }: { property: PropertyType }) {
  const navigate = useNavigate();
  const createEvaluation = useCreateEvaluation();

  const handleCreateEvaluation = () => {
    createEvaluation.mutate(property.id, {
      onSuccess: (newEval) => {
        navigate(`/properties/${property.id}/evaluations/${newEval.id}`);
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Create Button */}
      <div className="flex justify-end">
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

      {!property.evaluations?.length ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="mb-1 text-lg font-medium text-gray-800 dark:text-white/90">
            No Evaluations Yet
          </h3>
          <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Create an evaluation to analyze sale comps, rent comps, and investment returns.
          </p>
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
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
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
  );
}

function ConnectionsTab({ property }: { property: PropertyType }) {
  if (!property.connections?.length) {
    return (
      <PlaceholderTab
        title="No Connections"
        description="Link contacts (agents, contractors, lenders) to this property."
      />
    );
  }

  return (
    <div className="space-y-4">
      {property.connections.map((connection) => (
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
  );
}

function NotesTab({ property }: { property: PropertyType }) {
  if (!property.notes?.length) {
    return (
      <PlaceholderTab
        title="No Notes"
        description="Add notes about this property to track observations and reminders."
      />
    );
  }

  return (
    <div className="space-y-4">
      {property.notes.map((note) => (
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
  );
}

function DocumentsTab({ property }: { property: PropertyType }) {
  if (!property.documents?.length) {
    return (
      <PlaceholderTab
        title="No Documents"
        description="Upload documents like contracts, inspection reports, or photos."
      />
    );
  }

  return (
    <div className="space-y-4">
      {property.documents.map((doc) => (
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
                {doc.type} • {(doc.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(doc.uploadedUtc).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-sm text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
        {value || '—'}
      </dd>
    </div>
  );
}

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
        <svg
          className="h-8 w-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h3 className="mb-1 text-lg font-medium text-gray-800 dark:text-white/90">
        {title}
      </h3>
      <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}
