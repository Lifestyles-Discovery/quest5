import { useState } from 'react';
import { Link } from 'react-router';
import { Card } from '@components/ui/card';
import type { PropertySummary, PropertyStage } from '@app-types/property.types';
import { formatDistanceToNow } from 'date-fns';

interface PropertyCardProps {
  property: PropertySummary;
}

const STAGE_STYLES: Record<PropertyStage, { bg: string; text: string }> = {
  None: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' },
  Finding: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
  Evaluating: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
  },
  Negotiating: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-600 dark:text-yellow-400',
  },
  Diligence: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-600 dark:text-orange-400',
  },
  Closing: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
  Rehabbing: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400' },
  Leasing: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400' },
  Selling: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
  Inactive: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-500' },
};

function formatCurrency(value: number | undefined, compact = false): string {
  if (value === undefined || value === null) return '—';
  if (compact && Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCashflow(value: number | undefined): string {
  if (value === undefined || value === null) return '—';
  const sign = value >= 0 ? '' : '-';
  return `${sign}$${Math.abs(value).toFixed(0)}/mo`;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [imageError, setImageError] = useState(false);
  const stageStyle = STAGE_STYLES[property.stage] || STAGE_STYLES.None;
  const lastUpdateDate = new Date(property.lastUpdate);
  const hasMetrics = property.arv !== undefined || property.monthlyCashflow !== undefined;

  // Build property specs string
  const specs: string[] = [];
  if (property.beds != null) specs.push(`${property.beds} bd`);
  if (property.baths != null) specs.push(`${property.baths} ba`);
  if (property.sqft != null) specs.push(`${property.sqft.toLocaleString()} sf`);

  return (
    <Link to={`/deals/${property.id}`}>
      <Card>
        <div className="group cursor-pointer">
          {/* Property Image */}
          <div className="mb-4 overflow-hidden rounded-lg aspect-[3/2]">
            {imageError ? (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                <svg
                  className="h-12 w-12 text-gray-400"
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
            ) : (
              <img
                src={property.photoUrl || '/images/cards/card-01.jpg'}
                alt={property.address}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            )}
          </div>

          {/* Property Info */}
          <div>
            <h3 className="mb-1 font-semibold text-gray-800 dark:text-white/90 group-hover:text-brand-500">
              {property.address}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {property.city}, {property.state} {property.zip}
            </p>
            {specs.length > 0 && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{specs.join(' · ')}</p>
            )}
          </div>

          {/* Investment Metrics */}
          {hasMetrics && (
            <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-800/50">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">ARV</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {formatCurrency(property.arv, true)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Rent</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {formatCurrency(property.estimatedRent)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Cash Flow</p>
                <p
                  className={`text-sm font-medium ${
                    property.monthlyCashflow !== undefined && property.monthlyCashflow >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {formatCashflow(property.monthlyCashflow)}
                </p>
              </div>
            </div>
          )}

          {/* Stage and Date Row */}
          <div className="mt-3 flex items-center justify-between">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${stageStyle.bg} ${stageStyle.text}`}
            >
              {property.stage === 'Inactive' ? 'Archived' : property.stage}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(lastUpdateDate, { addSuffix: true })}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
