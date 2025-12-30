import { useState } from 'react';
import { useStates } from '@/hooks/api/useSearch';
import type { FprSearchParams } from '@app-types/search.types';

interface SearchFormProps {
  onSearch: (params: FprSearchParams) => void;
  isLoading: boolean;
  initialParams?: Partial<FprSearchParams>;
}

export default function SearchForm({
  onSearch,
  isLoading,
  initialParams,
}: SearchFormProps) {
  const [cities, setCities] = useState(initialParams?.cities || '');
  const [state, setState] = useState(initialParams?.state || '');
  const [resultLimit, setResultLimit] = useState(initialParams?.resultLimit || 100);
  const [daysOnMarket, setDaysOnMarket] = useState(initialParams?.daysOnMarket || 30);
  const [showMethodology, setShowMethodology] = useState(false);

  const { data: states } = useStates();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cities.trim() || !state) return;

    onSearch({
      cities: cities.trim(),
      state,
      resultLimit,
      daysOnMarket,
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:!bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Property Search
        </h2>
        <button
          type="button"
          onClick={() => setShowMethodology(!showMethodology)}
          className="text-sm text-primary hover:text-primary/80"
        >
          {showMethodology ? 'Hide' : 'Show'} FPR Methodology
        </button>
      </div>

      {showMethodology && (
        <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:!bg-blue-900/30">
          <h3 className="mb-2 font-medium text-blue-800 dark:text-blue-200">
            Feature-to-Price Ratio (FPR) Explained
          </h3>
          <p className="mb-2 text-sm text-blue-700 dark:text-blue-300">
            FPR measures how much "property" you get for your money:
          </p>
          <code className="block rounded bg-blue-100 p-2 text-sm dark:!bg-blue-900/50 dark:text-blue-200">
            FPR = (beds + baths + (sqft/1000)) / (price/100,000)
          </code>
          <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
            <strong>Relative FPR</strong> compares each property's FPR to the average in its zip code:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
            <li><span className="font-medium text-green-600 dark:text-green-400">1.5+</span> = Excellent value</li>
            <li><span className="font-medium text-blue-600 dark:text-blue-400">1.2+</span> = Good value</li>
            <li><span className="font-medium text-cyan-600 dark:text-cyan-400">1.0+</span> = Average</li>
            <li><span className="font-medium text-yellow-600 dark:text-yellow-400">0.8+</span> = Below average</li>
            <li><span className="font-medium text-red-600 dark:text-red-400">&lt;0.8</span> = Poor value</li>
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cities <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={cities}
              onChange={(e) => setCities(e.target.value)}
              placeholder="e.g., Austin, Round Rock, Cedar Park"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Separate multiple cities with commas
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              State <span className="text-red-500">*</span>
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select State</option>
              {states?.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Max Results
            </label>
            <select
              value={resultLimit}
              onChange={(e) => setResultLimit(Number(e.target.value))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Days on Market
            </label>
            <input
              type="number"
              min={1}
              value={daysOnMarket}
              onChange={(e) => setDaysOnMarket(Number(e.target.value))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !cities.trim() || !state}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium !text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? (
              <>
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
                Searching...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Properties
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
