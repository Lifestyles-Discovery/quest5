import { useState } from 'react';
import type { SaleComp, RentComp } from '@app-types/evaluation.types';
import PhotoGallery from '@/components/common/PhotoGallery';

interface CompDetailsProps {
  comp: SaleComp | RentComp;
  type: 'sale' | 'rent';
}

function isSaleComp(comp: SaleComp | RentComp): comp is SaleComp {
  return 'priceListed' in comp;
}

export default function CompDetails({ comp, type }: CompDetailsProps) {
  const [showGallery, setShowGallery] = useState(false);

  const photos = comp.photoURLs || [];
  const description = comp.descriptionPublic || '';

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null || value === 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get MLS number (both types have it now)
  const mlsNumber = comp.mlsNumber;

  return (
    <div className="space-y-4 p-4">
      {/* Description */}
      {description && (
        <div>
          <h4 className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Description
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {description}
          </p>
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-6">
        {mlsNumber && (
          <div>
            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">MLS#</dt>
            <dd className="text-sm text-gray-900 dark:text-white">{mlsNumber}</dd>
          </div>
        )}
        {comp.market && (
          <div>
            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Market</dt>
            <dd className="text-sm text-gray-900 dark:text-white">{comp.market}</dd>
          </div>
        )}
        {comp.listingType && (
          <div>
            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Type</dt>
            <dd className="text-sm text-gray-900 dark:text-white">{comp.listingType}</dd>
          </div>
        )}
        <div>
          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">DOM</dt>
          <dd className="text-sm text-gray-900 dark:text-white">{comp.daysOnMarket ?? '-'}</dd>
        </div>
        {type === 'sale' && isSaleComp(comp) && (
          <>
            {comp.annualHOA !== undefined && comp.annualHOA > 0 && (
              <div>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">HOA/Year</dt>
                <dd className="text-sm text-gray-900 dark:text-white">{formatCurrency(comp.annualHOA)}</dd>
              </div>
            )}
            {comp.taxesAnnual !== undefined && comp.taxesAnnual > 0 && (
              <div>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Taxes/Year</dt>
                <dd className="text-sm text-gray-900 dark:text-white">{formatCurrency(comp.taxesAnnual)}</dd>
              </div>
            )}
          </>
        )}
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Photos ({photos.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {photos.slice(0, 6).map((photo, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setShowGallery(true)}
                className="relative h-16 w-16 overflow-hidden rounded hover:opacity-90"
              >
                <img
                  src={photo}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {index === 5 && photos.length > 6 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-medium text-white">
                    +{photos.length - 6}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Photo Gallery Modal */}
      {showGallery && (
        <PhotoGallery photos={photos} onClose={() => setShowGallery(false)} />
      )}
    </div>
  );
}
