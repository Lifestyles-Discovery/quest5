import { useState, useEffect } from 'react';
import { useUpdateAttributes } from '@/hooks/api/useEvaluations';
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
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    beds: evaluation.beds || 0,
    baths: evaluation.baths || 0,
    garage: evaluation.garage || 0,
    sqft: evaluation.sqft || 0,
    yearBuilt: evaluation.yearBuilt || 0,
    subdivision: evaluation.subdivision || '',
    county: evaluation.county || '',
    listPrice: evaluation.listPrice || 0,
    taxesAnnual: evaluation.taxesAnnual || 0,
    hoaAnnual: evaluation.hoaAnnual || 0,
  });

  // Sync form data when evaluation changes (unless currently editing)
  useEffect(() => {
    if (!isEditing) {
      setFormData({
        beds: evaluation.beds || 0,
        baths: evaluation.baths || 0,
        garage: evaluation.garage || 0,
        sqft: evaluation.sqft || 0,
        yearBuilt: evaluation.yearBuilt || 0,
        subdivision: evaluation.subdivision || '',
        county: evaluation.county || '',
        listPrice: evaluation.listPrice || 0,
        taxesAnnual: evaluation.taxesAnnual || 0,
        hoaAnnual: evaluation.hoaAnnual || 0,
      });
    }
  }, [evaluation, isEditing]);

  const updateAttributes = useUpdateAttributes();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAttributes.mutate(
      {
        propertyId,
        evaluationId,
        attributes: formData,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  if (isEditing) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Property Attributes
          </h2>
          <button
            onClick={() => setIsEditing(false)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Beds
              </label>
              <input
                type="number"
                value={formData.beds}
                onChange={(e) => setFormData({ ...formData, beds: Number(e.target.value) })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Baths
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.baths}
                onChange={(e) => setFormData({ ...formData, baths: Number(e.target.value) })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Garage
              </label>
              <input
                type="number"
                value={formData.garage}
                onChange={(e) => setFormData({ ...formData, garage: Number(e.target.value) })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sqft
              </label>
              <input
                type="number"
                value={formData.sqft}
                onChange={(e) => setFormData({ ...formData, sqft: Number(e.target.value) })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Year Built
              </label>
              <input
                type="number"
                value={formData.yearBuilt}
                onChange={(e) => setFormData({ ...formData, yearBuilt: Number(e.target.value) })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                List Price
              </label>
              <input
                type="number"
                value={formData.listPrice}
                onChange={(e) => setFormData({ ...formData, listPrice: Number(e.target.value) })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Subdivision
              </label>
              <input
                type="text"
                value={formData.subdivision}
                onChange={(e) => setFormData({ ...formData, subdivision: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                County
              </label>
              <input
                type="text"
                value={formData.county}
                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Taxes/Year
              </label>
              <input
                type="number"
                value={formData.taxesAnnual}
                onChange={(e) => setFormData({ ...formData, taxesAnnual: Number(e.target.value) })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                HOA/Year
              </label>
              <input
                type="number"
                value={formData.hoaAnnual}
                onChange={(e) => setFormData({ ...formData, hoaAnnual: Number(e.target.value) })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateAttributes.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {updateAttributes.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Property Attributes
        </h2>
        <button
          onClick={() => setIsEditing(true)}
          className="text-sm text-primary hover:text-primary/80"
        >
          Edit
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Beds</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {evaluation.beds}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Baths</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {evaluation.baths}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Garage</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {evaluation.garage}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sqft</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatNumber(evaluation.sqft)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Year Built</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {evaluation.yearBuilt}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">List Price</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatCurrency(evaluation.listPrice)}
          </p>
        </div>

        <div className="col-span-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Subdivision</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {evaluation.subdivision || '-'}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">County</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {evaluation.county || '-'}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Taxes/Year</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatCurrency(evaluation.taxesAnnual)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">HOA/Year</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatCurrency(evaluation.hoaAnnual)}
          </p>
        </div>
      </div>
    </div>
  );
}
