import type { MarketSummary as MarketSummaryType } from '@app-types/search.types';

interface MarketSummaryProps {
  summary: MarketSummaryType;
  lastUpdated?: string;
}

export default function MarketSummary({ summary, lastUpdated }: MarketSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:!bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Market Summary
        </h3>
        {lastUpdated && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Updated: {formatDate(lastUpdated)}
          </span>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {summary.cities}, {summary.state}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Listings</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {summary.totalActiveListings.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">Median Price</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary.medianListPrice)}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">Median $/Sqft</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${Math.round(summary.medianPricePerSqft)}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">Median DOM</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {summary.medianDaysOnMarket}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">days</p>
        </div>
      </div>
    </div>
  );
}
