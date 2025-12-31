import { useState, useEffect, useRef, useMemo } from 'react';
import { useUpdateSaleComps, useToggleSaleCompInclusion } from '@/hooks/api/useEvaluations';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import type { Evaluation, SaleComp, SearchType, SaleCompInputs } from '@app-types/evaluation.types';
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

interface SaleCompsSectionProps {
  propertyId: string;
  evaluationId: string;
  evaluation: Evaluation;
  searchTypes: SearchType[];
  subjectLatitude?: number;
  subjectLongitude?: number;
  subjectAddress?: string;
}

export default function SaleCompsSection({
  propertyId,
  evaluationId,
  evaluation,
  searchTypes,
  subjectLatitude,
  subjectLongitude,
  subjectAddress,
}: SaleCompsSectionProps) {
  const saleCompGroup = evaluation.saleCompGroup;
  const [filters, setFilters] = useState<Partial<SaleCompInputs>>(
    saleCompGroup?.saleCompInputs || {}
  );
  const [showMap, setShowMap] = useState(() => {
    return localStorage.getItem('showSaleCompsMap') === 'true';
  });
  const isInitialMount = useRef(true);
  const isSyncingFromServer = useRef(false);
  const hasInitializedSearchTerm = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const updateSaleComps = useUpdateSaleComps();
  const toggleInclusion = useToggleSaleCompInclusion();

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
    (inputs: Partial<SaleCompInputs>) => {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Create new controller for this request
      abortControllerRef.current = new AbortController();

      const startTime = performance.now();
      updateSaleComps.mutate(
        {
          propertyId,
          evaluationId,
          inputs,
          signal: abortControllerRef.current.signal,
        },
        {
          onSettled: () => {
            console.log(`[SaleComps] API response: ${Math.round(performance.now() - startTime)}ms`);
          },
        }
      );
    },
    500
  );

  // Sync filters when evaluation changes (from server response)
  useEffect(() => {
    if (saleCompGroup?.saleCompInputs) {
      isSyncingFromServer.current = true;
      setFilters(saleCompGroup.saleCompInputs);
    }
  }, [saleCompGroup?.saleCompInputs]);

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

  const handleToggleComp = (comp: SaleComp) => {
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit',
    });
  };

  const saleComps = saleCompGroup?.saleComps || [];
  const includedComps = saleComps.filter((c) => c.include);

  const handleResetFilters = () => {
    // Use backend-provided initial values, fall back to current if not available
    const initialInputs = saleCompGroup?.initialSaleCompInputs || saleCompGroup?.saleCompInputs || {};
    setFilters(initialInputs);
  };

  const toggleMap = () => {
    const newValue = !showMap;
    setShowMap(newValue);
    localStorage.setItem('showSaleCompsMap', newValue.toString());
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sale Comps
            </h2>

            {/* Summary */}
            <div className="mt-2">
              {saleCompGroup && includedComps.length > 0 && (
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(saleCompGroup.calculatedValue)}
                </div>
              )}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {includedComps.length} of {saleComps.length} included
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
          zips={saleCompGroup?.zips}
          counties={saleCompGroup?.counties}
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
            type="sale"
          />
        </div>
      )}

      {/* Comps List */}
      <div className={`transition-opacity duration-150 ${updateSaleComps.isPending ? 'opacity-60' : ''}`}>
        {saleComps.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p>No sale comps found.</p>
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
                  Sold
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
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {saleComps.map((comp) => (
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
                    ${Math.round(comp.pricePerSqft)}
                  </td>
                  <td className="px-3 py-2 text-center text-sm text-gray-600 dark:text-gray-300">
                    {comp.beds}/{comp.baths}
                  </td>
                  <td className="px-3 py-2 text-right text-sm text-gray-600 dark:text-gray-300">
                    {comp.sqft.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(comp.dateSold)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Price Per Sqft Summary */}
      {saleCompGroup && includedComps.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Avg $/Sqft:</span>
            <span className="font-medium text-gray-900 dark:text-white">${Math.round(saleCompGroup.averagePricePerSqft)}</span>
            <span>×</span>
            <span>Subject Sqft:</span>
            <span className="font-medium text-gray-900 dark:text-white">{evaluation.sqft?.toLocaleString() ?? '-'}</span>
            <span>=</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(saleCompGroup.calculatedValue)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
