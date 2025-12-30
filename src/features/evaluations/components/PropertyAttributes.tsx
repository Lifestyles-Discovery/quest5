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
          value={evaluation.county || ''}
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
    </div>
  );
}
