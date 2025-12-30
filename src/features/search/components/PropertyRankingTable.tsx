import { useState } from 'react';
import type { RankedProperty, SortField, SortDirection } from '@app-types/search.types';

interface PropertyRankingTableProps {
  properties: RankedProperty[];
  onPropertySelect: (property: RankedProperty) => void;
  onEvaluate: (property: RankedProperty) => void;
  isEvaluating?: string | null;
}

export default function PropertyRankingTable({
  properties,
  onPropertySelect,
  onEvaluate,
  isEvaluating,
}: PropertyRankingTableProps) {
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProperties = [...properties].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = (bVal as string).toLowerCase();
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getFprBadgeClass = (relativeFpr: number) => {
    if (relativeFpr >= 1.5) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (relativeFpr >= 1.2) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    if (relativeFpr >= 1.0) return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
    if (relativeFpr >= 0.8) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="cursor-pointer px-3 py-3 text-left text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            {sortDirection === 'asc' ? (
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            ) : (
              <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" />
            )}
          </svg>
        )}
      </div>
    </th>
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:!bg-gray-800">
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Ranked Properties ({properties.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <SortHeader field="rank">#</SortHeader>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                Photo
              </th>
              <SortHeader field="address">Address</SortHeader>
              <SortHeader field="priceListed">Price</SortHeader>
              <SortHeader field="beds">Beds</SortHeader>
              <SortHeader field="baths">Baths</SortHeader>
              <SortHeader field="sqft">Sqft</SortHeader>
              <SortHeader field="yearBuilt">Year</SortHeader>
              <SortHeader field="daysOnMarket">DOM</SortHeader>
              <SortHeader field="relativeFpr">FPR</SortHeader>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedProperties.map((property) => (
              <tr
                key={property.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-gray-900 dark:text-white">
                  {property.rank}
                </td>
                <td className="px-3 py-3">
                  {property.photoUrl ? (
                    <img
                      src={property.photoUrl}
                      alt={property.address}
                      className="h-12 w-16 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-16 items-center justify-center rounded bg-gray-200 dark:bg-gray-700">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  )}
                </td>
                <td className="px-3 py-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {property.address}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {property.city}, {property.state} {property.zipCode}
                  </p>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(property.priceListed)}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {property.beds}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {property.baths}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {property.sqft.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {property.yearBuilt}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {property.daysOnMarket}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getFprBadgeClass(
                      property.relativeFpr
                    )}`}
                  >
                    {property.relativeFpr.toFixed(2)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onPropertySelect(property)}
                      className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                      title="View Details"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEvaluate(property)}
                      disabled={isEvaluating === property.id}
                      className="rounded p-1.5 text-primary hover:bg-primary/10 disabled:opacity-50"
                      title="Create Evaluation"
                    >
                      {isEvaluating === property.id ? (
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {properties.length === 0 && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <p>No properties found matching your criteria.</p>
          <p className="mt-1 text-sm">Try adjusting your search parameters.</p>
        </div>
      )}
    </div>
  );
}
