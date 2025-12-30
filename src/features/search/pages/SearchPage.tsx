import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useFprSearchMutation, useCreatePropertyFromSearch } from '@/hooks/api/useSearch';
import SearchForm from '../components/SearchForm';
import MarketSummary from '../components/MarketSummary';
import PropertyRankingTable from '../components/PropertyRankingTable';
import InvestmentModal from '../components/InvestmentModal';
import type {
  FprSearchParams,
  FprSearchResponse,
  RankedProperty,
} from '@app-types/search.types';

// LocalStorage key for persisting search state
const SEARCH_STATE_KEY = 'quest5_search_state';

interface PersistedSearchState {
  params: FprSearchParams;
  results: FprSearchResponse | null;
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState<FprSearchParams | null>(null);
  const [searchResults, setSearchResults] = useState<FprSearchResponse | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<RankedProperty | null>(null);
  const [evaluatingPropertyId, setEvaluatingPropertyId] = useState<string | null>(null);
  const [noPropertiesWarning, setNoPropertiesWarning] = useState(false);

  const fprSearch = useFprSearchMutation();
  const createProperty = useCreatePropertyFromSearch();

  // Load persisted state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SEARCH_STATE_KEY);
      if (saved) {
        const state: PersistedSearchState = JSON.parse(saved);
        setSearchParams(state.params);
        setSearchResults(state.results);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Persist state on changes
  useEffect(() => {
    if (searchParams || searchResults) {
      const state: PersistedSearchState = {
        params: searchParams!,
        results: searchResults,
      };
      localStorage.setItem(SEARCH_STATE_KEY, JSON.stringify(state));
    }
  }, [searchParams, searchResults]);

  const handleSearch = (params: FprSearchParams) => {
    setSearchParams(params);
    setNoPropertiesWarning(false);

    fprSearch.mutate(params, {
      onSuccess: (data) => {
        setSearchResults(data);
        if (data.noPropertiesFound) {
          setNoPropertiesWarning(true);
        }
      },
    });
  };

  const handlePropertySelect = (property: RankedProperty) => {
    setSelectedProperty(property);
  };

  const handleEvaluate = (property: RankedProperty) => {
    if (!property.mlsMarket || !property.mlsNumber) {
      // Fallback: navigate to properties page to create manually
      navigate('/properties');
      return;
    }

    setEvaluatingPropertyId(property.id);

    createProperty.mutate(
      { mlsMarket: property.mlsMarket, mlsNumber: property.mlsNumber },
      {
        onSuccess: (result) => {
          setEvaluatingPropertyId(null);
          setSelectedProperty(null);
          navigate(`/properties/${result.propertyId}/evaluations/${result.id}`);
        },
        onError: () => {
          setEvaluatingPropertyId(null);
        },
      }
    );
  };

  const handleCloseModal = () => {
    setSelectedProperty(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Property Search
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Find investment properties ranked by Feature-to-Price Ratio (FPR)
        </p>
      </div>

      {/* Search Form */}
      <SearchForm
        onSearch={handleSearch}
        isLoading={fprSearch.isPending}
        initialParams={searchParams || undefined}
      />

      {/* No Properties Warning */}
      {noPropertiesWarning && (
        <div className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5 text-yellow-600 dark:text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-yellow-800 dark:text-yellow-200">
              No properties found matching your criteria. Try adjusting your search parameters.
            </span>
          </div>
          <button
            onClick={() => setNoPropertiesWarning(false)}
            className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Error State */}
      {fprSearch.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5 text-red-600 dark:text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-red-800 dark:text-red-200">
              {fprSearch.error instanceof Error
                ? fprSearch.error.message
                : 'An error occurred while searching. Please try again.'}
            </span>
          </div>
        </div>
      )}

      {/* Results */}
      {searchResults && !searchResults.noPropertiesFound && (
        <>
          {/* Market Summary */}
          <MarketSummary
            summary={searchResults.marketSummary}
            lastUpdated={searchResults.lastUpdated}
          />

          {/* Property Rankings */}
          <PropertyRankingTable
            properties={searchResults.rankedProperties}
            onPropertySelect={handlePropertySelect}
            onEvaluate={handleEvaluate}
            isEvaluating={evaluatingPropertyId}
          />
        </>
      )}

      {/* Empty State */}
      {!searchResults && !fprSearch.isPending && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:!bg-gray-800">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Start Your Search
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Enter cities and state above to find investment properties ranked by FPR.
          </p>
        </div>
      )}

      {/* Investment Modal */}
      {selectedProperty && (
        <InvestmentModal
          property={selectedProperty}
          onClose={handleCloseModal}
          onEvaluate={() => handleEvaluate(selectedProperty)}
          isEvaluating={evaluatingPropertyId === selectedProperty.id}
        />
      )}
    </div>
  );
}
