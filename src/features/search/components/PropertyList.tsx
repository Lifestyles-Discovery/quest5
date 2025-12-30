import { useState } from 'react';
import type { RankedProperty } from '@app-types/search.types';

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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const handleRowClick = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
      {properties.map((property) => {
        const isExpanded = expandedId === property.id;
        const isCurrentlyEvaluating = isEvaluating === property.id;

        return (
          <div key={property.id}>
            {/* Main Row */}
            <div
              onClick={() => handleRowClick(property.id)}
              className={`flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                isExpanded ? 'bg-gray-50 dark:bg-gray-700/50' : ''
              }`}
            >
              {/* Rank */}
              <div className="w-8 text-center text-sm font-bold text-gray-400">
                {property.rank}
              </div>

              {/* Property Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900 dark:text-white">
                  {property.address}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {property.city}, {property.state} {property.zipCode}
                </p>
              </div>

              {/* Stats */}
              <div className="hidden items-center gap-6 text-sm sm:flex">
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(property.priceListed)}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {property.beds}/{property.baths} · {property.sqft.toLocaleString()} sqft
                  </p>
                </div>
                <div className={`font-bold ${getFprColor(property.relativeFpr)}`}>
                  {property.relativeFpr.toFixed(2)}
                </div>
              </div>

              {/* Mobile Stats */}
              <div className="flex items-center gap-3 text-sm sm:hidden">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(property.priceListed)}
                </span>
                <span className={`font-bold ${getFprColor(property.relativeFpr)}`}>
                  {property.relativeFpr.toFixed(2)}
                </span>
              </div>

              {/* Evaluate Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEvaluate(property);
                }}
                disabled={isCurrentlyEvaluating}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {isCurrentlyEvaluating ? (
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
                  'Evaluate'
                )}
              </button>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                <div className="flex flex-col gap-4 sm:flex-row">
                  {/* Photo */}
                  {property.photoUrl ? (
                    <img
                      src={property.photoUrl}
                      alt={property.address}
                      className="h-32 w-full rounded-lg object-cover sm:h-24 sm:w-32"
                    />
                  ) : (
                    <div className="flex h-32 w-full items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700 sm:h-24 sm:w-32">
                      <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-4">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Price</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          ${property.priceListed.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Beds/Baths</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {property.beds} / {property.baths}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Sqft</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {property.sqft.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Year Built</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {property.yearBuilt}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Days on Market</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {property.daysOnMarket}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">FPR Score</span>
                        <p className={`font-medium ${getFprColor(property.relativeFpr)}`}>
                          {property.relativeFpr.toFixed(2)}
                        </p>
                      </div>
                      {property.mlsNumber && (
                        <div className="col-span-2">
                          <span className="text-gray-500 dark:text-gray-400">MLS #</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {property.mlsNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
