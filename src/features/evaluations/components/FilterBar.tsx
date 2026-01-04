import type { SaleCompInputs, RentCompInputs, SearchType } from '@app-types/evaluation.types';
import FilterChip, { RangeEditor, NumberEditor, SelectEditor, LocationEditor } from './FilterChip';

type CompInputs = SaleCompInputs | RentCompInputs;

interface FilterBarProps {
  filters: Partial<CompInputs>;
  onChange: (filters: Partial<CompInputs>) => void;
  searchTypes: SearchType[];
  zips?: string[];
  counties?: string[];
  onReset?: () => void;
  subdivision?: string; // For repopulating search term when switching to subdivision search
}

const BEDS_MAX = 6;
const BATHS_MAX = 5;
const GARAGE_MAX = 4;

// Strip common suffixes from subdivision names for cleaner search
function stripSubdivisionSuffix(subdivision: string): string {
  if (!subdivision) return '';
  return subdivision
    .replace(/\s+(SEC|SECTION|PHASE|PH|UNIT|BLK|BLOCK|LOT|PT|PART|RESUB|REPLAT|AMEND|AMD|REV|REVISED)\s*\d*\s*[A-Z]?\s*$/i, '')
    .replace(/\s+\d+\s*$/, '')
    .trim();
}

// Format helpers for chip labels
function formatLocation(searchTerm?: string, searchType?: string): string {
  if (!searchTerm) return 'any location';
  if (searchType?.toLowerCase() === 'radius') {
    return `${searchTerm} miles`;
  }
  return searchTerm;
}

function formatRange(min: number | null, max: number | null, unit: string): string {
  const hasMin = min !== null;
  const hasMax = max !== null;

  if (!hasMin && !hasMax) return `any ${unit}`;
  if (hasMin && hasMax && min === max) return `${min} ${unit}`;
  if (hasMin && hasMax) return `${min}-${max} ${unit}`;
  if (hasMin) return `${min}+ ${unit}`;
  if (hasMax) return `0-${max} ${unit}`;
  return `any ${unit}`;
}

function formatTolerance(value: number | undefined, prefix: string, suffix: string): string {
  if (!value) return `any ${suffix}`;
  return `${prefix}${value} ${suffix}`;
}

function formatMonths(value: number | undefined): string {
  if (!value) return 'any time';
  return `${value} mo`;
}

export default function FilterBar({
  filters,
  onChange,
  searchTypes,
  zips = [],
  counties = [],
  onReset,
  subdivision,
}: FilterBarProps) {
  const isBroadSearch = filters.ignoreParametersExceptMonthsClosed || false;
  // Use first available search type as default (handles case where only Radius is available)
  const defaultSearchType = searchTypes[0]?.type || 'subdivision';

  // When broad search is on, clicking a muted chip turns it off and activates that filter
  const handleMutedChipClick = () => {
    onChange({ ...filters, ignoreParametersExceptMonthsClosed: false });
  };

  // Muted chip style for when broad search is active
  const mutedChipClass = isBroadSearch
    ? 'opacity-40 pointer-events-none'
    : '';

  return (
    <div className="space-y-2">
      {/* Broad search banner - shown when active */}
      {isBroadSearch && (
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
            Broad search active
          </span>
          <span className="text-gray-500 dark:text-gray-400">— only location + time apply</span>
          <button
            type="button"
            onClick={() => onChange({ ...filters, ignoreParametersExceptMonthsClosed: false })}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            use precise filters
          </button>
        </div>
      )}

      {/* Main filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Location - always active, even in broad search */}
        <FilterChip label={formatLocation(filters.searchTerm, filters.searchType || defaultSearchType)}>
          <LocationEditor
            searchType={filters.searchType || defaultSearchType}
            searchTerm={filters.searchTerm || ''}
            searchTypes={searchTypes}
            onSearchTypeChange={(type) => {
              const wasRadius = filters.searchType?.toLowerCase() === 'radius';
              const isNowSubdivision = type.toLowerCase() === 'subdivision';
              // Repopulate search term with subdivision when switching from radius to subdivision
              if (wasRadius && isNowSubdivision && subdivision) {
                const strippedSubdivision = stripSubdivisionSuffix(subdivision);
                onChange({ ...filters, searchType: type, searchTerm: strippedSubdivision });
              } else {
                onChange({ ...filters, searchType: type });
              }
            }}
            onSearchTermChange={(term) => onChange({ ...filters, searchTerm: term })}
          />
        </FilterChip>

        {/* Beds - muted when broad search */}
        <div className={mutedChipClass} onClick={isBroadSearch ? handleMutedChipClick : undefined}>
          <FilterChip label={formatRange(filters.bedsMin || null, filters.bedsMax != null && filters.bedsMax <= BEDS_MAX ? filters.bedsMax : null, 'beds')}>
            <RangeEditor
              label="Beds"
              min={filters.bedsMin || null}
              max={filters.bedsMax != null && filters.bedsMax <= BEDS_MAX ? filters.bedsMax : null}
              rangeMax={BEDS_MAX}
              onChange={(min, max) => onChange({ ...filters, bedsMin: min ?? undefined, bedsMax: max ?? undefined })}
            />
          </FilterChip>
        </div>

        {/* Baths - muted when broad search */}
        <div className={mutedChipClass} onClick={isBroadSearch ? handleMutedChipClick : undefined}>
          <FilterChip label={formatRange(filters.bathsMin || null, filters.bathsMax != null && filters.bathsMax <= BATHS_MAX ? filters.bathsMax : null, 'baths')}>
            <RangeEditor
              label="Baths"
              min={filters.bathsMin || null}
              max={filters.bathsMax != null && filters.bathsMax <= BATHS_MAX ? filters.bathsMax : null}
              rangeMax={BATHS_MAX}
              onChange={(min, max) => onChange({ ...filters, bathsMin: min ?? undefined, bathsMax: max ?? undefined })}
            />
          </FilterChip>
        </div>

        {/* Sqft - muted when broad search */}
        <div className={mutedChipClass} onClick={isBroadSearch ? handleMutedChipClick : undefined}>
          <FilterChip label={formatTolerance(filters.sqftPlusMinus, '±', 'sqft')}>
            <NumberEditor
              label="Sqft tolerance"
              value={filters.sqftPlusMinus || 0}
              onChange={(value) => onChange({ ...filters, sqftPlusMinus: value })}
              prefix="±"
              step={100}
            />
          </FilterChip>
        </div>

        {/* Months - always active, even in broad search */}
        <FilterChip label={formatMonths(filters.monthsClosed)}>
          <NumberEditor
            label="Sold within"
            value={filters.monthsClosed || 0}
            onChange={(value) => onChange({ ...filters, monthsClosed: value })}
            suffix="months"
          />
        </FilterChip>

        {/* Year - muted when broad search */}
        <div className={mutedChipClass} onClick={isBroadSearch ? handleMutedChipClick : undefined}>
          <FilterChip label={formatTolerance(filters.yearBuiltPlusMinus, '±', 'year')}>
            <NumberEditor
              label="Year tolerance"
              value={filters.yearBuiltPlusMinus || 0}
              onChange={(value) => onChange({ ...filters, yearBuiltPlusMinus: value })}
              prefix="±"
              suffix="years"
            />
          </FilterChip>
        </div>

        {/* Garage - muted when broad search */}
        <div className={mutedChipClass} onClick={isBroadSearch ? handleMutedChipClick : undefined}>
          <FilterChip label={formatRange(filters.garageMin || null, filters.garageMax != null && filters.garageMax <= GARAGE_MAX ? filters.garageMax : null, 'garage')}>
            <RangeEditor
              label="Garage"
              min={filters.garageMin || null}
              max={filters.garageMax != null && filters.garageMax <= GARAGE_MAX ? filters.garageMax : null}
              rangeMax={GARAGE_MAX}
              onChange={(min, max) => onChange({ ...filters, garageMin: min ?? undefined, garageMax: max ?? undefined })}
            />
          </FilterChip>
        </div>

        {/* Zip - muted when broad search */}
        {zips.length > 0 && (
          <div className={mutedChipClass} onClick={isBroadSearch ? handleMutedChipClick : undefined}>
            <FilterChip label={filters.confineToZip || 'any zip'}>
              <SelectEditor
                label="Zip"
                value={filters.confineToZip || ''}
                options={zips}
                onChange={(value) => onChange({ ...filters, confineToZip: value })}
              />
            </FilterChip>
          </div>
        )}

        {/* County - muted when broad search */}
        {counties.length > 0 && (
          <div className={mutedChipClass} onClick={isBroadSearch ? handleMutedChipClick : undefined}>
            <FilterChip label={filters.confineToCounty || 'any county'}>
              <SelectEditor
                label="County"
                value={filters.confineToCounty || ''}
                options={counties}
                onChange={(value) => onChange({ ...filters, confineToCounty: value })}
              />
            </FilterChip>
          </div>
        )}

        {/* Broad search toggle - only show when NOT in broad search */}
        {!isBroadSearch && (
          <button
            type="button"
            onClick={() => onChange({ ...filters, ignoreParametersExceptMonthsClosed: true })}
            className="rounded-full px-3 py-1 text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            broad
          </button>
        )}

        {/* Reset */}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-full px-3 py-1 text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            reset
          </button>
        )}
      </div>
    </div>
  );
}
