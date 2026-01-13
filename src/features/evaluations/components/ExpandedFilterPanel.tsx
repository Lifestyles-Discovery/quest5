import type { SaleCompInputs, RentCompInputs, SearchType } from '@app-types/evaluation.types';
import { RangeEditor, NumberEditor, SelectEditor, LocationEditor } from './FilterChip';

type CompInputs = SaleCompInputs | RentCompInputs;

interface ExpandedFilterPanelProps {
  filters: Partial<CompInputs>;
  onChange: (filters: Partial<CompInputs>) => void;
  searchTypes: SearchType[];
  zips?: string[];
  counties?: string[];
  subdivision?: string;
  defaultRadius?: number;
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

export default function ExpandedFilterPanel({
  filters,
  onChange,
  searchTypes,
  zips = [],
  counties = [],
  subdivision,
  defaultRadius,
}: ExpandedFilterPanelProps) {
  const isBroadSearch = filters.ignoreParametersExceptMonthsClosed || false;
  const defaultSearchType = searchTypes[0]?.type || 'subdivision';

  // Muted style for filters disabled during broad search
  const mutedClass = isBroadSearch ? 'opacity-40 pointer-events-none' : '';

  const handleSearchTypeChange = (type: string) => {
    const wasRadius = filters.searchType?.toLowerCase() === 'radius';
    const isNowRadius = type.toLowerCase() === 'radius';
    const isNowSubdivision = type.toLowerCase() === 'subdivision';

    if (wasRadius && isNowSubdivision && subdivision) {
      const strippedSubdivision = stripSubdivisionSuffix(subdivision);
      onChange({ ...filters, searchType: type, searchTerm: strippedSubdivision });
    } else if (isNowRadius) {
      const radiusSearchType = searchTypes.find(st => st.type?.toLowerCase() === 'radius');
      const radiusValue = defaultRadius || radiusSearchType?.defaultSearchTerm || '';
      onChange({ ...filters, searchType: type, searchTerm: String(radiusValue) });
    } else {
      onChange({ ...filters, searchType: type });
    }
  };

  return (
    <div className="space-y-3">
      {/* Row 1: Location + numeric filters - all inline */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <LocationEditor
          searchType={filters.searchType || defaultSearchType}
          searchTerm={filters.searchTerm || ''}
          searchTypes={searchTypes}
          onSearchTypeChange={handleSearchTypeChange}
          onSearchTermChange={(term) => onChange({ ...filters, searchTerm: term })}
          compact
        />
        <NumberEditor
          label="Sold within"
          value={filters.monthsClosed || 0}
          onChange={(value) => onChange({ ...filters, monthsClosed: value })}
          suffix="mo"
        />
        <div className={mutedClass}>
          <NumberEditor
            label="Sqft ±"
            value={filters.sqftPlusMinus || 0}
            onChange={(value) => onChange({ ...filters, sqftPlusMinus: value })}
            step={100}
          />
        </div>
        <div className={mutedClass}>
          <NumberEditor
            label="Year ±"
            value={filters.yearBuiltPlusMinus || 0}
            onChange={(value) => onChange({ ...filters, yearBuiltPlusMinus: value })}
          />
        </div>
        {/* Zip & County inline with other filters */}
        {zips.length > 0 && (
          <div className={mutedClass}>
            <SelectEditor
              label="Zip"
              value={filters.confineToZip || ''}
              options={zips}
              onChange={(value) => onChange({ ...filters, confineToZip: value })}
            />
          </div>
        )}
        {counties.length > 0 && (
          <div className={mutedClass}>
            <SelectEditor
              label="County"
              value={filters.confineToCounty || ''}
              options={counties}
              onChange={(value) => onChange({ ...filters, confineToCounty: value })}
            />
          </div>
        )}
      </div>

      {/* Row 2: Beds, Baths, Garage side by side */}
      <div className={`flex flex-wrap gap-x-8 gap-y-2 ${mutedClass}`}>
        <RangeEditor
          label="Beds"
          min={filters.bedsMin || null}
          max={filters.bedsMax != null && filters.bedsMax <= BEDS_MAX ? filters.bedsMax : null}
          rangeMax={BEDS_MAX}
          onChange={(min, max) => onChange({ ...filters, bedsMin: min ?? undefined, bedsMax: max ?? undefined })}
        />
        <RangeEditor
          label="Baths"
          min={filters.bathsMin || null}
          max={filters.bathsMax != null && filters.bathsMax <= BATHS_MAX ? filters.bathsMax : null}
          rangeMax={BATHS_MAX}
          onChange={(min, max) => onChange({ ...filters, bathsMin: min ?? undefined, bathsMax: max ?? undefined })}
        />
        <RangeEditor
          label="Garage"
          min={filters.garageMin || null}
          max={filters.garageMax != null && filters.garageMax <= GARAGE_MAX ? filters.garageMax : null}
          rangeMax={GARAGE_MAX}
          onChange={(min, max) => onChange({ ...filters, garageMin: min ?? undefined, garageMax: max ?? undefined })}
        />
      </div>
    </div>
  );
}
