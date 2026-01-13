import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles';
import { formatNumber } from '@/utils/formatters';
import type { SaleCompInputs, RentCompInputs } from '@app-types/evaluation.types';

interface SubjectProperty {
  sqft: number;
  beds: number;
  baths: number;
  garage: number;
  yearBuilt: number;
}

interface PDFSearchCriteriaProps {
  inputs: SaleCompInputs | RentCompInputs;
  subject: SubjectProperty;
}

const criteriaStyles = StyleSheet.create({
  container: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  label: {
    fontSize: 7,
    color: colors.textMuted,
    marginRight: 2,
  },
  value: {
    fontSize: 7,
    color: colors.textSecondary,
  },
  separator: {
    fontSize: 7,
    color: colors.borderLight,
    marginHorizontal: 6,
  },
  broadSearchNote: {
    fontSize: 7,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 3,
  },
});

/**
 * Format search type for display
 */
function formatSearchType(searchType: string): string {
  const typeMap: Record<string, string> = {
    subdivision: 'Subdivision',
    radius: 'Radius',
    zip: 'ZIP',
    city: 'City',
    county: 'County',
  };
  return typeMap[searchType.toLowerCase()] || searchType;
}

/**
 * Format search term based on search type
 */
function formatSearchTerm(searchType: string, searchTerm: string): string {
  if (!searchTerm) return '-';
  if (searchType.toLowerCase() === 'radius') {
    return `${searchTerm} mi`;
  }
  return searchTerm;
}

/**
 * Renders search criteria in a compact inline format.
 * Displayed above the comps table in PDF reports.
 */
export function PDFSearchCriteria({ inputs, subject }: PDFSearchCriteriaProps) {
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

  // Calculate actual ranges from subject property
  const sqftMin = Math.max(0, subject.sqft - sqftPlusMinus);
  const sqftMax = subject.sqft + sqftPlusMinus;
  const yearMin = subject.yearBuilt - yearBuiltPlusMinus;
  const yearMax = subject.yearBuilt + yearBuiltPlusMinus;

  // Check if we have county/zip filters
  const hasCountyFilter = confineToCounty && confineToCounty.trim() !== '';
  const hasZipFilter = confineToZip && confineToZip.trim() !== '';

  // Build criteria items
  const items: { label: string; value: string }[] = [
    { label: formatSearchType(searchType), value: formatSearchTerm(searchType, searchTerm) },
    { label: 'Sqft', value: ignoreParametersExceptMonthsClosed ? 'Any' : `${formatNumber(sqftMin)}-${formatNumber(sqftMax)}` },
    { label: 'Beds', value: ignoreParametersExceptMonthsClosed ? 'Any' : `${bedsMin}-${bedsMax}` },
    { label: 'Baths', value: ignoreParametersExceptMonthsClosed ? 'Any' : `${bathsMin}-${bathsMax}` },
    { label: 'Garage', value: ignoreParametersExceptMonthsClosed ? 'Any' : `${garageMin}-${garageMax}` },
    { label: 'Year', value: ignoreParametersExceptMonthsClosed ? 'Any' : `${yearMin}-${yearMax}` },
    { label: 'Last', value: `${monthsClosed} mo` },
  ];

  if (hasCountyFilter) {
    items.push({ label: 'County', value: confineToCounty });
  }
  if (hasZipFilter) {
    items.push({ label: 'ZIP', value: confineToZip });
  }

  return (
    <View style={criteriaStyles.container}>
      <View style={criteriaStyles.row}>
        {items.map((item, index) => (
          <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center' }}>
            {index > 0 && <Text style={criteriaStyles.separator}>•</Text>}
            <Text style={criteriaStyles.label}>{item.label}:</Text>
            <Text style={criteriaStyles.value}>{item.value}</Text>
          </View>
        ))}
      </View>

      {ignoreParametersExceptMonthsClosed && (
        <Text style={criteriaStyles.broadSearchNote}>
          Broad search: filters ignored except time range
        </Text>
      )}
    </View>
  );
}
