import { useState, useEffect, useRef, useMemo } from 'react';
import { useUpdateRentComps, useToggleRentCompInclusion } from '@/hooks/api/useEvaluations';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import type { Evaluation, RentComp, SearchType, RentCompInputs } from '@app-types/evaluation.types';
import CompsMap from './CompsMap';
import FilterBar from './FilterBar';
import PhotoThumbnail from '@/components/common/PhotoThumbnail';
import Checkbox from '@/components/form/input/Checkbox';

/**
 * Strips common suffixes from subdivision names for cleaner search
 * e.g., "OAK FOREST SEC 01" → "OAK FOREST"
 */
function stripSubdivisionSuffix(subdivision: string): string {
  if (!subdivision) return '';
  // Remove common patterns: SEC ##, SECTION ##, PHASE ##, PH ##, UNIT ##, etc.
  return subdivision
    .replace(/\s+(SEC|SECTION|PHASE|PH|UNIT|BLK|BLOCK|LOT|PT|PART|RESUB|REPLAT|AMEND|AMD|REV|REVISED)\s*\d*\s*[A-Z]?\s*$/i, '')
    .replace(/\s+\d+\s*$/, '') // Remove trailing numbers
    .trim();
}

interface RentCompsSectionProps {
  propertyId: string;
  evaluationId: string;
  evaluation: Evaluation;
  searchTypes: SearchType[];
  subjectLatitude?: number;
  subjectLongitude?: number;
  subjectAddress?: string;
}

export default function RentCompsSection({
  propertyId,
  evaluationId,
  evaluation,
  searchTypes,
  subjectLatitude,
  subjectLongitude,
  subjectAddress,
}: RentCompsSectionProps) {
  const rentCompGroup = evaluation.rentCompGroup;
  const [filters, setFilters] = useState<Partial<RentCompInputs>>(
    rentCompGroup?.rentCompInputs || {}
  );
  const [showMap, setShowMap] = useState(() => {
    return localStorage.getItem('showRentCompsMap') === 'true';
  });
  const isInitialMount = useRef(true);
  const isSyncingFromServer = useRef(false);
  const hasInitializedSearchTerm = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const updateRentComps = useUpdateRentComps();
  const toggleInclusion = useToggleRentCompInclusion();

  // Filter to only show Subdivision and Radius search types
  const filteredSearchTypes = useMemo(() => {
    const allowedTypes = ['subdivision', 'radius'];
    return searchTypes.filter((st) =>
      st.type && allowedTypes.includes(st.type.toLowerCase())
    );
  }, [searchTypes]);

  // Auto-populate search term with stripped subdivision on first load
  useEffect(() => {
    if (
      !hasInitializedSearchTerm.current &&
      evaluation.subdivision &&
      (!filters.searchTerm || filters.searchTerm === '')
    ) {
      hasInitializedSearchTerm.current = true;
      const strippedSubdivision = stripSubdivisionSuffix(evaluation.subdivision);
      if (strippedSubdivision) {
        setFilters((prev) => ({ ...prev, searchTerm: strippedSubdivision }));
      }
    }
  }, [evaluation.subdivision, filters.searchTerm]);

  // Debounced search function with request cancellation
  const [debouncedSearch, cancelSearch] = useDebouncedCallback(
    (inputs: Partial<RentCompInputs>) => {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Create new controller for this request
      abortControllerRef.current = new AbortController();

      const startTime = performance.now();
      updateRentComps.mutate(
        {
          propertyId,
          evaluationId,
          inputs,
          signal: abortControllerRef.current.signal,
        },
        {
          onSettled: () => {
            console.log(`[RentComps] API response: ${Math.round(performance.now() - startTime)}ms`);
          },
        }
      );
    },
    500
  );

  // Sync filters when evaluation changes (from server response)
  useEffect(() => {
    if (rentCompGroup?.rentCompInputs) {
      isSyncingFromServer.current = true;
      setFilters(rentCompGroup.rentCompInputs);
    }
  }, [rentCompGroup?.rentCompInputs]);

  // Auto-search when filters change (skip initial mount and server syncs)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isSyncingFromServer.current) {
      isSyncingFromServer.current = false;
      return;
    }
    debouncedSearch(filters);
  }, [filters, debouncedSearch]);

  const handleToggleComp = (comp: RentComp) => {
    // Cancel any pending search to prevent it from overwriting the toggle result
    cancelSearch();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    toggleInclusion.mutate({
      propertyId,
      evaluationId,
      compId: comp.id,
      include: !comp.include,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const rentComps = rentCompGroup?.rentComps || [];
  const includedComps = rentComps.filter((c) => c.include);

  const handleResetFilters = () => {
    // Use backend-provided initial values, fall back to current if not available
    const initialInputs = rentCompGroup?.initialRentCompInputs || rentCompGroup?.rentCompInputs || {};
    setFilters(initialInputs);
  };

  const toggleMap = () => {
    const newValue = !showMap;
    setShowMap(newValue);
    localStorage.setItem('showRentCompsMap', newValue.toString());
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Rent Comps
            </h2>

            {/* Summary */}
            <div className="mt-2">
              {rentCompGroup && includedComps.length > 0 && (
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(rentCompGroup.calculatedValue)}/mo
                </div>
              )}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {includedComps.length} of {rentComps.length} included
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleMap}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/50">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          searchTypes={filteredSearchTypes}
          zips={rentCompGroup?.zips}
          counties={rentCompGroup?.counties}
          onReset={handleResetFilters}
          subdivision={evaluation.subdivision}
        />
      </div>

      {/* Map */}
      {showMap && (
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <CompsMap
            subjectLatitude={subjectLatitude}
            subjectLongitude={subjectLongitude}
            subjectAddress={subjectAddress}
            comps={includedComps}
            type="rent"
          />
        </div>
      )}

      {/* Comps List */}
      <div className={`transition-opacity duration-150 ${updateRentComps.isPending ? 'opacity-60' : ''}`}>
        {rentComps.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p>No rent comps found.</p>
            <p className="mt-1 text-sm">Try adjusting your filters.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Include
                </th>
                <th className="w-12 px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Photo
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Address
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Subdivision
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                  Rent
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                  $/Sqft
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                  Bed/Bath
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                  Sqft
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                  DOM
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rentComps.map((comp) => (
                <tr
                  key={comp.id}
                  className={`${
                    comp.include
                      ? 'bg-white dark:bg-gray-800'
                      : 'bg-gray-100 opacity-60 dark:bg-gray-900'
                  }`}
                >
                  <td className="px-3 py-2">
                    <Checkbox
                      checked={comp.include}
                      onChange={() => handleToggleComp(comp)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <PhotoThumbnail photos={comp.photoURLs} size="sm" />
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {comp.street}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {comp.city}, {comp.state}
                    </p>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                    {comp.subdivision}
                  </td>
                  <td className="px-3 py-2 text-right text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(comp.priceSold)}
                  </td>
                  <td className="px-3 py-2 text-right text-sm text-gray-600 dark:text-gray-300">
                    ${comp.pricePerSqft.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-center text-sm text-gray-600 dark:text-gray-300">
                    {comp.beds}/{comp.baths}
                  </td>
                  <td className="px-3 py-2 text-right text-sm text-gray-600 dark:text-gray-300">
                    {comp.sqft.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right text-sm text-gray-500 dark:text-gray-400">
                    {comp.daysOnMarket}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Price Per Sqft Summary */}
      {rentCompGroup && includedComps.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Avg $/Sqft:</span>
            <span className="font-medium text-gray-900 dark:text-white">${rentCompGroup.averagePricePerSqft.toFixed(2)}</span>
            <span>×</span>
            <span>Subject Sqft:</span>
            <span className="font-medium text-gray-900 dark:text-white">{evaluation.sqft?.toLocaleString() ?? '-'}</span>
            <span>=</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(rentCompGroup.calculatedValue)}/mo
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
