import { useState, useEffect, useRef, useMemo, Fragment } from 'react';
import { useUpdateRentComps, useToggleRentCompInclusion } from '@/hooks/api/useEvaluations';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { useLocalStorageBoolean } from '@/hooks/useLocalStorage';
import { useAuth } from '@/context/AuthContext';
import { useReadOnly } from '@/context/ReadOnlyContext';
import type { Evaluation, RentComp, SearchType, RentCompInputs } from '@app-types/evaluation.types';
import CompsMap from './CompsMap';
import FilterBar from './FilterBar';
import SearchCriteriaSummary from './SearchCriteriaSummary';
import PhotoThumbnail from '@/components/common/PhotoThumbnail';
import Checkbox from '@/components/form/input/Checkbox';
import CompDetails from './CompDetails';

type RentSortKey = 'street' | 'subdivision' | 'priceSold' | 'pricePerSqft' | 'beds' | 'baths' | 'garage' | 'sqft' | 'yearBuilt';
type SortOrder = 'asc' | 'desc';

function SortIndicator({ sortKey: currentSortKey, columnKey, sortOrder }: { sortKey: RentSortKey | null; columnKey: RentSortKey; sortOrder: SortOrder }) {
  const isActive = currentSortKey === columnKey;
  return (
    <span className="ml-1 inline-flex flex-col gap-0.5">
      <svg
        className={isActive && sortOrder === 'asc' ? 'text-brand-500' : 'text-gray-300 dark:text-gray-600'}
        width="8"
        height="5"
        viewBox="0 0 8 5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z"
          fill="currentColor"
        />
      </svg>
      <svg
        className={isActive && sortOrder === 'desc' ? 'text-brand-500' : 'text-gray-300 dark:text-gray-600'}
        width="8"
        height="5"
        viewBox="0 0 8 5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

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
  const { user } = useAuth();
  const { isReadOnly } = useReadOnly();
  const rentCompGroup = evaluation.rentCompGroup;
  const [filters, setFilters] = useState<Partial<RentCompInputs>>(
    rentCompGroup?.rentCompInputs || {}
  );
  const [showMap, setShowMap] = useState(() => {
    return localStorage.getItem('showRentCompsMap') === 'true';
  });
  const [isFilterPanelExpanded, toggleFilterPanel] = useLocalStorageBoolean('rentCompsFilterPanelExpanded', false);
  const [sortKey, setSortKey] = useState<RentSortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedCompId, setExpandedCompId] = useState<string | null>(null);
  const isInitialMount = useRef(true);
  const lastServerFiltersRef = useRef<string>('');
  const hasInitializedSearchTerm = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateRentComps = useUpdateRentComps();
  const toggleInclusion = useToggleRentCompInclusion();

  // Filter and order search types: subdivision, radius, zip, city, county
  const filteredSearchTypes = useMemo(() => {
    const typeOrder = ['subdivision', 'radius', 'zip', 'city', 'county'];
    return searchTypes
      .filter((st) => st.type && typeOrder.includes(st.type.toLowerCase()))
      .sort((a, b) => {
        const aIndex = typeOrder.indexOf(a.type?.toLowerCase() || '');
        const bIndex = typeOrder.indexOf(b.type?.toLowerCase() || '');
        return aIndex - bIndex;
      });
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

  // Cleanup error timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  // Core search function with request cancellation and error handling
  const executeSearch = (inputs: Partial<RentCompInputs>) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // Create new controller for this request
    abortControllerRef.current = new AbortController();
    // Clear any previous error
    setLastError(null);

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
        onError: (error) => {
          // Don't show error for aborted requests (user changed filters again)
          if (error instanceof Error && error.name === 'CanceledError') {
            return;
          }

          // Extract error message
          let errorMessage = 'Failed to load comps. Please try again.';
          const axiosError = error as { response?: { data?: string; status?: number } };
          if (axiosError.response?.data && typeof axiosError.response.data === 'string') {
            errorMessage = axiosError.response.data;
          } else if (axiosError.response?.status === 401) {
            errorMessage = 'Session expired. Please refresh the page.';
          } else if (axiosError.response?.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }

          console.error('[RentComps] Search failed:', { error, inputs, propertyId, evaluationId });
          setLastError(errorMessage);

          // Auto-clear error after 8 seconds
          if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
          errorTimeoutRef.current = setTimeout(() => setLastError(null), 8000);
        },
      }
    );
  };

  // Debounced search for typing/incremental changes (300ms for snappy feel)
  const [debouncedSearch, cancelSearch] = useDebouncedCallback(executeSearch, 300);

  // Immediate search for mode switches (bypasses debounce)
  const immediateSearch = (inputs: Partial<RentCompInputs>) => {
    cancelSearch();
    executeSearch(inputs);
  };

  // Sync filters when evaluation changes (from server response)
  useEffect(() => {
    if (rentCompGroup?.rentCompInputs) {
      const serverInputs = rentCompGroup.rentCompInputs;

      // Preserve auto-populated searchTerm if server's is empty
      // This prevents a race condition where sync effect overwrites auto-populate
      setFilters((prev) => {
        if (
          hasInitializedSearchTerm.current &&
          prev.searchTerm &&
          (!serverInputs.searchTerm || serverInputs.searchTerm === '')
        ) {
          const merged = { ...serverInputs, searchTerm: prev.searchTerm };
          lastServerFiltersRef.current = JSON.stringify(merged);
          return merged;
        }
        lastServerFiltersRef.current = JSON.stringify(serverInputs);
        return serverInputs;
      });
    }
  }, [rentCompGroup?.rentCompInputs]);

  // Auto-search when filters change (skip if matches server state)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Compare current filters to what server sent - if they match, don't re-search
    const currentFiltersJson = JSON.stringify(filters);
    if (currentFiltersJson === lastServerFiltersRef.current) {
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

  const rentComps = useMemo(() => rentCompGroup?.rentComps || [], [rentCompGroup?.rentComps]);
  const includedComps = rentComps.filter((c) => c.include);

  // Disable expansion for Discovery (non-MLS) data source
  const isExpansionEnabled = evaluation.compDataSource !== 'Discovery';

  const handleSort = (key: RentSortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const handleRowClick = (compId: string, e: React.MouseEvent) => {
    if (!isExpansionEnabled) return;
    // Don't expand if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button, input, label')) return;
    setExpandedCompId(expandedCompId === compId ? null : compId);
  };

  const sortedComps = useMemo(() => {
    if (!sortKey) return rentComps;
    return [...rentComps].sort((a, b) => {
      if (sortKey === 'street' || sortKey === 'subdivision') {
        const aVal = (a[sortKey] ?? '').toLowerCase();
        const bVal = (b[sortKey] ?? '').toLowerCase();
        const cmp = aVal.localeCompare(bVal);
        return sortOrder === 'asc' ? cmp : -cmp;
      }
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [rentComps, sortKey, sortOrder]);

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
        {isReadOnly ? (
          <SearchCriteriaSummary inputs={filters as RentCompInputs} />
        ) : (
          <FilterBar
            filters={filters}
            onChange={setFilters}
            onImmediateChange={(newFilters) => {
              setFilters(newFilters);
              immediateSearch(newFilters);
            }}
            searchTypes={filteredSearchTypes}
            zips={rentCompGroup?.zips}
            counties={rentCompGroup?.counties}
            onReset={handleResetFilters}
            subdivision={evaluation.subdivision}
            defaultRadius={user?.preferences?.evaluationRadius}
            isExpanded={isFilterPanelExpanded}
            onToggleExpanded={toggleFilterPanel}
          />
        )}
      </div>

      {/* Error Banner */}
      {lastError && (
        <div className="mx-4 mt-3 flex items-center gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="flex-1">{lastError}</span>
          <button
            type="button"
            onClick={() => setLastError(null)}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              setLastError(null);
              executeSearch(filters);
            }}
            className="rounded px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-500/20"
          >
            Retry
          </button>
        </div>
      )}

      {/* Map */}
      {showMap && (
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <CompsMap
            subjectLatitude={subjectLatitude}
            subjectLongitude={subjectLongitude}
            subjectAddress={subjectAddress}
            comps={rentComps}
            type="rent"
            onToggleComp={(compId) => {
              const comp = rentComps.find((c) => c.id === compId);
              if (comp) handleToggleComp(comp);
            }}
            isReadOnly={isReadOnly}
          />
        </div>
      )}

      {/* Comps List */}
      <div className={`overflow-x-auto transition-opacity duration-150 ${updateRentComps.isPending ? 'opacity-60' : ''}`}>
        {rentComps.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p>No rent comps found.</p>
            <p className="mt-1 text-sm">Try adjusting your filters.</p>
          </div>
        ) : (
          <table className="min-w-[900px] divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900">
              <tr>
                {isExpansionEnabled && <th className="w-8 px-2 py-2"></th>}
                {!isReadOnly && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Include
                  </th>
                )}
                <th className="w-12 px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Photo
                </th>
                <th
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none"
                  onClick={() => handleSort('street')}
                >
                  <span className="inline-flex items-center">
                    Address
                    <SortIndicator sortKey={sortKey} columnKey="street" sortOrder={sortOrder} />
                  </span>
                </th>
                <th
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none"
                  onClick={() => handleSort('subdivision')}
                >
                  <span className="inline-flex items-center">
                    Subdivision
                    <SortIndicator sortKey={sortKey} columnKey="subdivision" sortOrder={sortOrder} />
                  </span>
                </th>
                <th
                  className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none"
                  onClick={() => handleSort('priceSold')}
                >
                  <span className="inline-flex items-center justify-end">
                    Rent
                    <SortIndicator sortKey={sortKey} columnKey="priceSold" sortOrder={sortOrder} />
                  </span>
                </th>
                <th
                  className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none"
                  onClick={() => handleSort('pricePerSqft')}
                >
                  <span className="inline-flex items-center justify-end">
                    $/Sqft
                    <SortIndicator sortKey={sortKey} columnKey="pricePerSqft" sortOrder={sortOrder} />
                  </span>
                </th>
                <th
                  className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none"
                  onClick={() => handleSort('beds')}
                >
                  <span className="inline-flex items-center justify-center">
                    Bd/Ba/Gar
                    <SortIndicator sortKey={sortKey} columnKey="beds" sortOrder={sortOrder} />
                  </span>
                </th>
                <th
                  className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none"
                  onClick={() => handleSort('sqft')}
                >
                  <span className="inline-flex items-center justify-end">
                    Sqft
                    <SortIndicator sortKey={sortKey} columnKey="sqft" sortOrder={sortOrder} />
                  </span>
                </th>
                <th
                  className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none"
                  onClick={() => handleSort('yearBuilt')}
                >
                  <span className="inline-flex items-center justify-end">
                    Year
                    <SortIndicator sortKey={sortKey} columnKey="yearBuilt" sortOrder={sortOrder} />
                  </span>
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                  DOM
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedComps.map((comp) => {
                const isExpanded = isExpansionEnabled && expandedCompId === comp.id;
                return (
                  <Fragment key={comp.id}>
                    <tr
                      onClick={(e) => handleRowClick(comp.id, e)}
                      className={`transition-colors ${isExpansionEnabled ? 'cursor-pointer' : ''} ${
                        comp.include
                          ? 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-750'
                          : 'bg-gray-100 opacity-50 line-through decoration-gray-500 dark:bg-gray-900 dark:decoration-gray-400'
                      } ${isExpanded ? 'bg-gray-50 dark:bg-gray-750' : ''}`}
                    >
                      {isExpansionEnabled && (
                        <td className="px-2 py-2">
                          <svg
                            className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </td>
                      )}
                      {!isReadOnly && (
                        <td className="px-3 py-2">
                          <Checkbox
                            checked={comp.include}
                            onChange={() => handleToggleComp(comp)}
                          />
                        </td>
                      )}
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
                        {comp.beds}/{comp.baths}/{comp.garage}
                      </td>
                      <td className="px-3 py-2 text-right text-sm text-gray-600 dark:text-gray-300">
                        {comp.sqft.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right text-sm text-gray-600 dark:text-gray-300">
                        {comp.yearBuilt || '-'}
                      </td>
                      <td className="px-3 py-2 text-right text-sm text-gray-500 dark:text-gray-400">
                        {comp.daysOnMarket}
                      </td>
                    </tr>
                    {isExpansionEnabled && isExpanded && (
                      <tr>
                        <td colSpan={11} className="bg-gray-50 dark:bg-gray-900/50">
                          <CompDetails comp={comp} type="rent" />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
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
