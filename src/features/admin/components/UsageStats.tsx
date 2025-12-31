import { useState } from 'react';
import { format, subDays } from 'date-fns';
import Button from '@components/ui/button/Button';
import { Card } from '@components/ui/card';
import { useEvaluationUsage } from '@hooks/api/useAdmin';

export function UsageStats() {
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 30), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: usage, isLoading, error, refetch } = useEvaluationUsage(
    startDate,
    endDate
  );

  const handleUpdate = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Date Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
        <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
            />
          </div>
        </div>
        <Button onClick={handleUpdate} disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? 'Loading...' : 'Update'}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error loading usage statistics. Please try again.
          </p>
        </div>
      )}

      {/* Stats Grid */}
      {usage && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  {usage.totalEvaluationsCount}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Evaluations
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  {usage.propertiesCount}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Properties
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  {usage.notesCount}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Notes
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  {usage.documentsCount}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Documents
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  {usage.connectionsCount}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Connections
                </p>
              </div>
            </Card>
          </div>

          {/* Discovery vs Quest */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <h4 className="mb-4 font-medium text-gray-800 dark:text-white/90">
                Evaluation Types
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Discovery
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white/90">
                    {usage.discoveryCount} ({usage.discoveryPortion.toFixed(1)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Quest
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white/90">
                    {usage.questCount} ({usage.questPortion.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </Card>

            {/* Market Breakdown */}
            <Card>
              <h4 className="mb-4 font-medium text-gray-800 dark:text-white/90">
                By Market
              </h4>
              {usage.marketCounts.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No market data available
                </p>
              ) : (
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {usage.marketCounts.map((mc) => (
                    <div
                      key={mc.market}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600 dark:text-gray-400">
                        {mc.market}
                      </span>
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {mc.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Stage Breakdown */}
          <Card>
            <h4 className="mb-4 font-medium text-gray-800 dark:text-white/90">
              By Stage
            </h4>
            {usage.stageCounts.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No stage data available
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {usage.stageCounts.map((sc) => (
                  <div key={sc.stage} className="text-center">
                    <p className="text-lg font-bold text-gray-800 dark:text-white/90">
                      {sc.count}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {sc.stage}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
