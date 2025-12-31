import { useState, useEffect, useRef, useMemo } from 'react';
import { useUpdateRentComps, useToggleRentCompInclusion } from '@/hooks/api/useEvaluations';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import type { Evaluation, RentComp, SearchType, RentCompInputs } from '@app-types/evaluation.types';
import CompsMap from './CompsMap';

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
  const [showMoreFilters, setShowMoreFilters] = useState(() => {
    return localStorage.getItem('showMoreCompFilters') === 'true';
  });
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

  const toggleMoreFilters = () => {
    const newValue = !showMoreFilters;
    setShowMoreFilters(newValue);
    localStorage.setItem('showMoreCompFilters', newValue.toString());
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
      <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-8">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Search Type
            </label>
            <select
              value={filters.searchType || ''}
              onChange={(e) => setFilters({ ...filters, searchType: e.target.value })}
              className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {filteredSearchTypes.map((st) => (
                <option key={st.type} value={st.type}>
                  {st.type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              {filters.searchType?.toLowerCase() === 'radius' ? 'Radius (miles)' : 'Subdivision'}
            </label>
            <input
              type={filters.searchType?.toLowerCase() === 'radius' ? 'number' : 'text'}
              value={filters.searchTerm || ''}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              placeholder={filters.searchType?.toLowerCase() === 'radius' ? '0.5' : 'e.g. Oak Forest'}
              step={filters.searchType?.toLowerCase() === 'radius' ? '0.1' : undefined}
              onFocus={(e) => e.target.select()}
              className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className={filters.ignoreParametersExceptMonthsClosed ? 'opacity-50' : ''}>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Sqft +/-
            </label>
            <input
              type="number"
              value={filters.sqftPlusMinus || ''}
              onChange={(e) => setFilters({ ...filters, sqftPlusMinus: Number(e.target.value) })}
              onFocus={(e) => e.target.select()}
              className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className={filters.ignoreParametersExceptMonthsClosed ? 'opacity-50' : ''}>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Year +/-
            </label>
            <input
              type="number"
              value={filters.yearBuiltPlusMinus || ''}
              onChange={(e) => setFilters({ ...filters, yearBuiltPlusMinus: Number(e.target.value) })}
              onFocus={(e) => e.target.select()}
              className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className={filters.ignoreParametersExceptMonthsClosed ? 'opacity-50' : ''}>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Beds Min
            </label>
            <input
              type="number"
              value={filters.bedsMin || ''}
              onChange={(e) => setFilters({ ...filters, bedsMin: Number(e.target.value) })}
              onFocus={(e) => e.target.select()}
              className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className={filters.ignoreParametersExceptMonthsClosed ? 'opacity-50' : ''}>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Beds Max
            </label>
            <input
              type="number"
              value={filters.bedsMax || ''}
              onChange={(e) => setFilters({ ...filters, bedsMax: Number(e.target.value) })}
              onFocus={(e) => e.target.select()}
              className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Months
            </label>
            <input
              type="number"
              value={filters.monthsClosed || ''}
              onChange={(e) => setFilters({ ...filters, monthsClosed: Number(e.target.value) })}
              onFocus={(e) => e.target.select()}
              className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Zip
            </label>
            <select
              value={filters.confineToZip || ''}
              onChange={(e) => setFilters({ ...filters, confineToZip: e.target.value })}
              className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Any zip</option>
              {rentCompGroup?.zips?.map((zip) => (
                <option key={zip} value={zip}>{zip}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-end gap-1">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.ignoreParametersExceptMonthsClosed || false}
                onChange={(e) => setFilters({ ...filters, ignoreParametersExceptMonthsClosed: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">Broad search</span>
            </label>
            <button
              type="button"
              onClick={toggleMoreFilters}
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-left"
            >
              {showMoreFilters ? 'Less ▴' : 'More ▾'}
            </button>
          </div>
        </div>

        {/* Expanded filters */}
        {showMoreFilters && (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className={filters.ignoreParametersExceptMonthsClosed ? 'opacity-50' : ''}>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Baths Min
              </label>
              <input
                type="number"
                value={filters.bathsMin || ''}
                onChange={(e) => setFilters({ ...filters, bathsMin: Number(e.target.value) })}
                onFocus={(e) => e.target.select()}
                className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className={filters.ignoreParametersExceptMonthsClosed ? 'opacity-50' : ''}>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Baths Max
              </label>
              <input
                type="number"
                value={filters.bathsMax || ''}
                onChange={(e) => setFilters({ ...filters, bathsMax: Number(e.target.value) })}
                onFocus={(e) => e.target.select()}
                className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className={filters.ignoreParametersExceptMonthsClosed ? 'opacity-50' : ''}>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Garage Min
              </label>
              <input
                type="number"
                value={filters.garageMin || ''}
                onChange={(e) => setFilters({ ...filters, garageMin: Number(e.target.value) })}
                onFocus={(e) => e.target.select()}
                className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className={filters.ignoreParametersExceptMonthsClosed ? 'opacity-50' : ''}>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Garage Max
              </label>
              <input
                type="number"
                value={filters.garageMax || ''}
                onChange={(e) => setFilters({ ...filters, garageMax: Number(e.target.value) })}
                onFocus={(e) => e.target.select()}
                className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                County
              </label>
              <select
                value={filters.confineToCounty || ''}
                onChange={(e) => setFilters({ ...filters, confineToCounty: e.target.value })}
                className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Any county</option>
                {rentCompGroup?.counties?.map((county) => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>
          </div>
        )}
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
      <div className={`max-h-[500px] overflow-auto transition-opacity duration-150 ${updateRentComps.isPending ? 'opacity-60' : ''}`}>
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
                    <input
                      type="checkbox"
                      checked={comp.include}
                      onChange={() => handleToggleComp(comp)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
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
