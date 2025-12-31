import { useState } from 'react';
import type { RankedProperty } from '@app-types/search.types';
import PhotoGallery from '@/components/common/PhotoGallery';

interface PropertyListProps {
  properties: RankedProperty[];
  onEvaluate: (property: RankedProperty) => void;
  isEvaluating?: string | null;
}

export default function PropertyList({
  properties,
  onEvaluate,
  isEvaluating,
}: PropertyListProps) {
  const [galleryPhotos, setGalleryPhotos] = useState<string[] | null>(null);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${Math.round(value / 1000)}K`;
  };

  const getFprColor = (relativeFpr: number) => {
    if (relativeFpr >= 1.5) return 'text-green-600 dark:text-green-400';
    if (relativeFpr >= 1.2) return 'text-blue-600 dark:text-blue-400';
    if (relativeFpr >= 1.0) return 'text-gray-600 dark:text-gray-400';
    if (relativeFpr >= 0.8) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const openGallery = (property: RankedProperty) => {
    const photos = property.photoUrls?.length > 0
      ? property.photoUrls
      : property.photoUrl
        ? [property.photoUrl]
        : [];

    if (photos.length > 0) {
      setGalleryPhotos(photos);
    }
  };

  return (
    <>
      <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
        {/* Header Row - Desktop */}
        <div className="hidden items-center gap-3 bg-gray-50 px-3 py-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:bg-gray-800/50 dark:text-gray-400 sm:gap-4 sm:px-4 lg:flex">
          <div className="w-6" />
          <div className="w-16" />
          <div className="min-w-0 flex-1">Property</div>
          {/* Stats header - matches nested flex structure below */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-right">Price</div>
            <div className="w-12 text-center">Year</div>
            <div className="group relative w-10 cursor-help text-right">
              <span className="border-b border-dotted border-gray-400">FPR</span>
              <div className="pointer-events-none absolute right-0 top-6 z-10 w-64 rounded-lg bg-gray-900 p-3 text-left text-xs font-normal normal-case tracking-normal text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                <p className="font-medium">Feature-to-Price Ratio</p>
                <p className="mt-1 text-gray-300">
                  Compares property features (beds, baths, sqft, year) to price. Higher = better value relative to this market. 1.0 is average.
                </p>
              </div>
            </div>
          </div>
          <div className="w-[88px]" />
        </div>

        {properties.map((property) => {
          const isCurrentlyEvaluating = isEvaluating === property.id;
          const hasPhotos = (property.photoUrls?.length > 0) || property.photoUrl;

          return (
            <div key={property.id} className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
              {/* Rank */}
              <div className="w-6 text-center text-sm font-bold text-gray-400">
                {property.rank}
              </div>

              {/* Photo Thumbnail */}
              {hasPhotos ? (
                <button
                  onClick={() => openGallery(property)}
                  className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded"
                >
                  <img
                    src={property.photoUrls?.[0] || property.photoUrl}
                    alt={property.address}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                  {property.photoUrls?.length > 1 && (
                    <span className="absolute bottom-0.5 right-0.5 rounded bg-black/60 px-1 text-[10px] text-white">
                      {property.photoUrls.length}
                    </span>
                  )}
                </button>
              ) : (
                <div className="flex h-12 w-16 flex-shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              )}

              {/* Property Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900 dark:text-white">
                  {property.address}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {property.city}, {property.state} {property.zipCode}
                </p>
              </div>

              {/* Stats - Desktop */}
              <div className="hidden items-center gap-4 text-sm lg:flex">
                <div className="w-20 text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(property.priceListed)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {property.beds}/{property.baths} · {property.sqft.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 text-center text-gray-600 dark:text-gray-400">
                  {property.yearBuilt}
                </div>
                <div className={`w-10 text-right font-bold ${getFprColor(property.relativeFpr)}`}>
                  {property.relativeFpr.toFixed(2)}
                </div>
              </div>

              {/* Stats - Tablet */}
              <div className="hidden items-center gap-3 text-sm sm:flex lg:hidden">
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(property.priceListed)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {property.beds}/{property.baths}
                  </p>
                </div>
                <div className={`font-bold ${getFprColor(property.relativeFpr)}`}>
                  {property.relativeFpr.toFixed(2)}
                </div>
              </div>

              {/* Stats - Mobile */}
              <div className="flex items-center gap-2 text-sm sm:hidden">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(property.priceListed)}
                </span>
                <span className={`font-bold ${getFprColor(property.relativeFpr)}`}>
                  {property.relativeFpr.toFixed(2)}
                </span>
              </div>

              {/* Evaluate Button */}
              <button
                onClick={() => onEvaluate(property)}
                disabled={isCurrentlyEvaluating}
                className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 sm:px-4"
              >
                {isCurrentlyEvaluating ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  'Evaluate'
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Photo Gallery */}
      {galleryPhotos && (
        <PhotoGallery
          photos={galleryPhotos}
          onClose={() => setGalleryPhotos(null)}
        />
      )}
    </>
  );
}
