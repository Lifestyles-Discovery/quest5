import { useUpdateAttributes } from '@/hooks/api/useEvaluations';
import { EditableField } from '@/components/form/EditableField';
import type { Evaluation } from '@app-types/evaluation.types';

interface PropertyAttributesProps {
  propertyId: string;
  evaluationId: string;
  evaluation: Evaluation;
}

export default function PropertyAttributes({
  propertyId,
  evaluationId,
  evaluation,
}: PropertyAttributesProps) {
  const updateAttributes = useUpdateAttributes();

  const handleSave = async (field: string, value: number | string) => {
    await updateAttributes.mutateAsync({
      propertyId,
      evaluationId,
      attributes: { [field]: value },
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Property Attributes
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <EditableField
          label="Beds"
          value={evaluation.beds || 0}
          format="number"
          suffix=" beds"
          onSave={(v) => handleSave('beds', v)}
        />

        <EditableField
          label="Baths"
          value={evaluation.baths || 0}
          format="decimal"
          suffix=" baths"
          step={0.5}
          onSave={(v) => handleSave('baths', v)}
        />

        <EditableField
          label="Garage"
          value={evaluation.garage || 0}
          format="number"
          suffix=" car"
          onSave={(v) => handleSave('garage', v)}
        />

        <EditableField
          label="Sqft"
          value={evaluation.sqft || 0}
          format="number"
          suffix=" sqft"
          onSave={(v) => handleSave('sqft', v)}
        />

        <EditableField
          label="Year Built"
          value={evaluation.yearBuilt || 0}
          format="year"
          onSave={(v) => handleSave('yearBuilt', v)}
        />

        <EditableField
          label="List Price"
          value={evaluation.listPrice || 0}
          format="currency"
          onSave={(v) => handleSave('listPrice', v)}
        />

        <EditableField
          label="Subdivision"
          value={evaluation.subdivision || ''}
          format="text"
          className="col-span-2"
          onSave={(v) => handleSave('subdivision', v)}
        />

        <EditableField
          label="County"
          value={evaluation.county === 'null' ? '' : (evaluation.county || '')}
          format="text"
          onSave={(v) => handleSave('county', v)}
        />

        <EditableField
          label="Taxes/Year"
          value={evaluation.taxesAnnual || 0}
          format="currency"
          suffix="/yr"
          onSave={(v) => handleSave('taxesAnnual', v)}
        />

        <EditableField
          label="HOA/Year"
          value={evaluation.hoaAnnual || 0}
          format="currency"
          suffix="/yr"
          onSave={(v) => handleSave('hoaAnnual', v)}
        />
      </div>

      {/* Read-only Listing Info - only for MLS properties */}
      {evaluation.compDataSource !== 'Discovery' && (
        <ListingInfo evaluation={evaluation} />
      )}

      {/* Property Description */}
      {evaluation.descriptionPublic && (
        <PropertyDescription description={evaluation.descriptionPublic} />
      )}
    </div>
  );
}

function ListingInfo({ evaluation }: { evaluation: Evaluation }) {
  // Filter out invalid placeholder values from backend
  const isValidValue = (value: unknown): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'null' || lower === 'notset' || lower === '') return false;
    }
    return true;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    // Year < 1900 is an invalid placeholder (e.g., year 0001)
    if (date.getFullYear() < 1900) return null;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const items = [
    { label: 'MLS #', value: evaluation.mlsNumber },
    { label: 'Market', value: evaluation.mlsMarket },
    { label: 'Listing Office', value: evaluation.listingOfficeName },
    { label: 'List Date', value: formatDate(evaluation.listDate) },
    { label: 'Date Sold', value: formatDate(evaluation.dateSold) },
    { label: 'Data Source', value: evaluation.compDataSource },
  ].filter(item => isValidValue(item.value));

  if (items.length === 0) return null;

  return (
    <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
      <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        Listing Info
      </h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-6">
        {items.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="text-sm text-gray-900 dark:text-white">{value}</dd>
          </div>
        ))}
      </div>
    </div>
  );
}

function PropertyDescription({ description }: { description: string }) {
  return (
    <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
      <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        Property Description
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}
