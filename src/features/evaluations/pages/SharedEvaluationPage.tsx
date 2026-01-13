import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { authService } from '@/services/auth.service';
import { apiClient } from '@/api/client';
import type { Evaluation } from '@app-types/evaluation.types';
import type { Property } from '@app-types/property.types';
import type { User } from '@app-types/auth.types';
import { ReadOnlyProvider } from '@/context/ReadOnlyContext';
import { ThemeToggleButton } from '@/components/common/ThemeToggleButton';
import EvaluationContent from '../components/EvaluationContent';

/**
 * Public page for viewing shared evaluations
 * Professional, investor-focused presentation
 *
 * URL patterns:
 * - /share/:propertyId/:evaluationId/:guid (view only)
 * - /share/:propertyId/:evaluationId/:guid/:editKey (edit access - not currently implemented)
 */
export default function SharedEvaluationPage() {
  const { propertyId, evaluationId, guid } = useParams<{
    propertyId: string;
    evaluationId: string;
    guid: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [sessionKey, setSessionKey] = useState<string>('');
  const [creator, setCreator] = useState<User | null>(null);
  const [imageError, setImageError] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadSharedEvaluation() {
      if (!propertyId || !evaluationId || !guid) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      try {
        // Create a shared session to access the evaluation
        const session = await authService.createSharedSession(guid, '');
        const key = session.sessionKey;
        setSessionKey(key);
        setCreator(session.user);

        // Fetch the property and evaluation data using the shared session
        const [propertyResponse, evaluationResponse] = await Promise.all([
          apiClient.get<Property>(`properties/${propertyId}`, {
            headers: { sessionKey: key },
          }),
          apiClient.get<Evaluation>(`properties/${propertyId}/evaluations/${evaluationId}`, {
            headers: { sessionKey: key },
          }),
        ]);

        setProperty(propertyResponse.data);
        setEvaluation(evaluationResponse.data);
      } catch (err) {
        console.error('Failed to load shared evaluation:', err);
        setError('Unable to load this evaluation. The link may have expired or be invalid.');
      } finally {
        setLoading(false);
      }
    }

    loadSharedEvaluation();
  }, [propertyId, evaluationId, guid]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-gray-600 dark:text-gray-400">Loading evaluation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
          <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error-100 dark:bg-error-900/20">
            <svg className="h-8 w-8 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Unable to Load Evaluation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!evaluation || !property) {
    return null;
  }

  const primaryPhoto = property.photoUrls?.[0] || `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${encodeURIComponent(property.address + ', ' + property.city + ', ' + property.state)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
  const photoCount = property.photoUrls?.length || 0;

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photoCount - 1));
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) => (prev !== null && prev < photoCount - 1 ? prev + 1 : 0));
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const handleBackToGrid = () => {
    setSelectedPhotoIndex(null);
  };

  const handleCloseGallery = () => {
    setShowGallery(false);
    setSelectedPhotoIndex(null);
  };

  return (
    <ReadOnlyProvider isReadOnly={true} sessionKey={sessionKey}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Content */}
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Creator Info & Theme Toggle */}
          <div className="mb-4 flex items-center justify-between">
            {creator && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created by {creator.firstName} {creator.lastName} ({creator.email})
                {evaluation.created && (
                  <span className="ml-1">
                    on {new Date(evaluation.created).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </p>
            )}
            <ThemeToggleButton />
          </div>

          <div className="space-y-6">
            {/* Property Header Card */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Photo */}
                <div className="relative h-64 lg:h-auto">
                  {imageError ? (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <svg
                        className="h-16 w-16 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  ) : photoCount > 0 ? (
                    <button
                      onClick={() => setShowGallery(true)}
                      className="h-full w-full cursor-pointer"
                    >
                      <img
                        src={primaryPhoto}
                        alt={property.address}
                        className="h-full w-full object-cover hover:opacity-95"
                        onError={() => setImageError(true)}
                      />
                      {photoCount > 1 && (
                        <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                          +{photoCount - 1} photos
                        </div>
                      )}
                    </button>
                  ) : (
                    <img
                      src={primaryPhoto}
                      alt={property.address}
                      className="h-full w-full object-cover"
                      onError={() => setImageError(true)}
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
                      {/* Scenario Name */}
                      {evaluation.name && (
                        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {evaluation.name}
                        </p>
                      )}
                    </div>

                    {/* View Only Badge */}
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      View Only
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluation Content */}
            <EvaluationContent
              propertyId={propertyId!}
              evaluationId={evaluationId!}
              evaluation={evaluation}
              subjectLatitude={property.latitude}
              subjectLongitude={property.longitude}
              subjectAddress={property.address}
            />
          </div>
        </main>


        {/* Photo Gallery Modal */}
        {showGallery && photoCount > 0 && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={handleCloseGallery}
          >
            {/* Close button */}
            <button
              onClick={handleCloseGallery}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {selectedPhotoIndex === null ? (
              /* Thumbnail Grid View */
              <div
                className="max-h-[90vh] w-full max-w-5xl overflow-y-auto px-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {property.photoUrls?.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => handleThumbnailClick(index)}
                      className="aspect-square overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                    >
                      <img
                        src={url}
                        alt={`${property.address} - Photo ${index + 1}`}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Full-size Single Photo View */
              <>
                {/* Back to grid button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleBackToGrid(); }}
                  className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-full bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  All Photos
                </button>

                {/* Previous/Next buttons */}
                {photoCount > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrevPhoto(); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleNextPhoto(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Full-size image */}
                <img
                  src={property.photoUrls?.[selectedPhotoIndex] || primaryPhoto}
                  alt={`${property.address} - Photo ${selectedPhotoIndex + 1}`}
                  className="max-h-[90vh] max-w-[90vw] object-contain"
                  onClick={(e) => e.stopPropagation()}
                />

                {/* Photo counter */}
                {photoCount > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
                    {selectedPhotoIndex + 1} / {photoCount}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </ReadOnlyProvider>
  );
}
