import { useState, useEffect } from 'react';
import { useUpdateRentComps, useToggleRentCompInclusion } from '@/hooks/api/useEvaluations';
import type { Evaluation, RentComp, SearchType, RentCompInputs } from '@app-types/evaluation.types';

interface RentCompsSectionProps {
  propertyId: string;
  evaluationId: string;
  evaluation: Evaluation;
  searchTypes: SearchType[];
}

export default function RentCompsSection({
  propertyId,
  evaluationId,
  evaluation,
  searchTypes,
}: RentCompsSectionProps) {
  const rentCompGroup = evaluation.rentCompGroup;
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Partial<RentCompInputs>>(
    rentCompGroup?.rentCompInputs || {}
  );

  // Sync filters when evaluation changes
  useEffect(() => {
    if (rentCompGroup?.rentCompInputs) {
      setFilters(rentCompGroup.rentCompInputs);
    }
  }, [rentCompGroup?.rentCompInputs]);

  const updateRentComps = useUpdateRentComps();
  const toggleInclusion = useToggleRentCompInclusion();

  const handleSearch = () => {
    updateRentComps.mutate({
      propertyId,
      evaluationId,
      inputs: filters,
    });
  };

  const handleToggleComp = (comp: RentComp) => {
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

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Rent Comps
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-primary hover:text-primary/80"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Summary */}
        <div className="mt-2 flex items-center gap-4 text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {includedComps.length} of {rentComps.length} included
          </span>
          {rentCompGroup && (
            <>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className="font-medium text-gray-900 dark:text-white">
                Avg: {formatCurrency(rentCompGroup.averageRentPrice)}/mo
              </span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                Est. Rent: {formatCurrency(rentCompGroup.calculatedValue)}/mo
              </span>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Search Type
              </label>
              <select
                value={filters.searchType || ''}
                onChange={(e) => setFilters({ ...filters, searchType: e.target.value })}
                className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700"
              >
                {searchTypes.map((type) => (
                  <option key={type.name} value={type.name}>
                    {type.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Search Term
              </label>
              <input
                type="text"
                value={filters.searchTerm || ''}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                placeholder="Subdivision, zip..."
                className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Sqft +/-
              </label>
              <input
                type="number"
                value={filters.sqftPlusMinus || ''}
                onChange={(e) => setFilters({ ...filters, sqftPlusMinus: Number(e.target.value) })}
                className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Year Built +/-
              </label>
              <input
                type="number"
                value={filters.yearBuiltPlusMinus || ''}
                onChange={(e) => setFilters({ ...filters, yearBuiltPlusMinus: Number(e.target.value) })}
                className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Beds Min
              </label>
              <input
                type="number"
                value={filters.bedsMin || ''}
                onChange={(e) => setFilters({ ...filters, bedsMin: Number(e.target.value) })}
                className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Beds Max
              </label>
              <input
                type="number"
                value={filters.bedsMax || ''}
                onChange={(e) => setFilters({ ...filters, bedsMax: Number(e.target.value) })}
                className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Months Listed
              </label>
              <input
                type="number"
                value={filters.monthsClosed || ''}
                onChange={(e) => setFilters({ ...filters, monthsClosed: Number(e.target.value) })}
                className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.confineToZip || false}
                  onChange={(e) => setFilters({ ...filters, confineToZip: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-xs text-gray-700 dark:text-gray-300">Same Zip</span>
              </label>
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={handleSearch}
              disabled={updateRentComps.isPending}
              className="rounded bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {updateRentComps.isPending ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      )}

      {/* Comps List */}
      <div className="max-h-[500px] overflow-auto">
        {rentComps.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p>No rent comps found.</p>
            <p className="mt-1 text-sm">Adjust filters and search.</p>
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
                  <td className="px-3 py-2 text-right text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(comp.rentPrice)}/mo
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
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Avg $/Sqft: ${rentCompGroup.averagePricePerSqft.toFixed(2)}
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              Estimated Rent: {formatCurrency(rentCompGroup.calculatedValue)}/mo
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
