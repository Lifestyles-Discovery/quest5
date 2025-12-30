import type { MarketSummary as MarketSummaryType } from '@app-types/search.types';

interface MarketSummaryProps {
  summary: MarketSummaryType;
  propertyCount: number;
}

export default function MarketSummary({ summary, propertyCount }: MarketSummaryProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${Math.round(value / 1000)}K`;
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
      <span className="font-medium text-gray-900 dark:text-white">
        {propertyCount} properties
      </span>
      <span>in {summary.cities}, {summary.state}</span>
      <span className="hidden sm:inline">·</span>
      <span className="hidden sm:inline">Median {formatCurrency(summary.medianListPrice)}</span>
    </div>
  );
}
