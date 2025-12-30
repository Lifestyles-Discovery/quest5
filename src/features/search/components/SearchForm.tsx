import { useState, useEffect } from 'react';
import { US_STATES, type FprSearchParams } from '@app-types/search.types';

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

  // Sync form state when initialParams changes (e.g., from persisted state)
  useEffect(() => {
    if (initialParams) {
      setCities(initialParams.cities || '');
      setState(initialParams.state || '');
    }
  }, [initialParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cities.trim() || !state) return;

    onSearch({
      cities: cities.trim(),
      state,
      resultLimit: 25,
      daysOnMarket: 14,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cities
          </label>
          <input
            type="text"
            value={cities}
            onChange={(e) => setCities(e.target.value)}
            placeholder="Austin, Round Rock, Cedar Park"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            required
          />
        </div>

        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            State
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            required
          >
            <option value="">Select</option>
            {US_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !cities.trim() || !state}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
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
            'Search'
          )}
        </button>
      </div>
    </form>
  );
}
