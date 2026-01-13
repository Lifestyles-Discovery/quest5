import type { SaleCompInputs, RentCompInputs } from '@app-types/evaluation.types';
import { formatNumber } from '@/utils/formatters';

interface SearchCriteriaSummaryProps {
  inputs: SaleCompInputs | RentCompInputs;
}

/**
 * Displays search criteria in a compact inline format (read-only)
 * Used in shared/read-only views to show what filters were applied
 */
export default function SearchCriteriaSummary({
  inputs,
}: SearchCriteriaSummaryProps) {
  const {
    searchType,
    searchTerm,
    sqftPlusMinus,
    bedsMin,
    bedsMax,
    bathsMin,
    bathsMax,
    garageMin,
    garageMax,
    yearBuiltPlusMinus,
    monthsClosed,
    confineToCounty,
    confineToZip,
    ignoreParametersExceptMonthsClosed,
  } = inputs;

  // Format search type for display
  const formatSearchType = (type: string): string => {
    const typeMap: Record<string, string> = {
      subdivision: 'Subdivision',
      radius: 'Radius',
      zip: 'ZIP',
      city: 'City',
      county: 'County',
    };
    return typeMap[type.toLowerCase()] || type;
  };

  // Format search term based on type
  const formatSearchTermDisplay = (type: string, term: string): string => {
    if (!term) return '-';
    if (type.toLowerCase() === 'radius') return `${term} mi`;
    return term;
  };

  const hasCountyFilter = confineToCounty && confineToCounty.trim() !== '';
  const hasZipFilter = confineToZip && confineToZip.trim() !== '';

  // Build criteria items - only include filters that are actually used
  const items: { label: string; value: string }[] = [
    { label: formatSearchType(searchType), value: formatSearchTermDisplay(searchType, searchTerm) },
  ];

  // Only add property filters if NOT in broad search mode
  if (!ignoreParametersExceptMonthsClosed) {
    items.push(
      { label: 'Beds', value: `${bedsMin}-${bedsMax}` },
      { label: 'Baths', value: `${bathsMin}-${bathsMax}` },
      { label: 'Sqft', value: `±${formatNumber(sqftPlusMinus)}` },
      { label: 'Year', value: `±${yearBuiltPlusMinus}` },
      { label: 'Garage', value: `${garageMin}-${garageMax}` },
    );
  }

  // Time range is always used
  items.push({ label: 'Last', value: `${monthsClosed} mo` });

  // County/ZIP filters if set
  if (hasCountyFilter) items.push({ label: 'County', value: confineToCounty });
  if (hasZipFilter) items.push({ label: 'ZIP', value: confineToZip });

  return (
    <div className="text-sm text-gray-500 dark:text-gray-400">
      <span className="flex flex-wrap items-center gap-x-1 gap-y-1">
        {items.map((item, index) => (
          <span key={item.label} className="inline-flex items-center">
            {index > 0 && <span className="mx-1.5 text-gray-300 dark:text-gray-600">•</span>}
            <span className="text-gray-400 dark:text-gray-500">{item.label}:</span>
            <span className="ml-0.5 font-medium text-gray-600 dark:text-gray-300">{item.value}</span>
          </span>
        ))}
      </span>
      {ignoreParametersExceptMonthsClosed && (
        <p className="mt-1 text-xs italic text-gray-400 dark:text-gray-500">
          Broad search: filters ignored except time range
        </p>
      )}
    </div>
  );
}
