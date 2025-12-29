import { useState } from 'react';
import PageMeta from '@components/common/PageMeta';
import PageBreadcrumb from '@components/common/PageBreadCrumb';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyFilter } from '../components/PropertyFilter';
import { NewPropertyModal } from '../components/NewPropertyModal';
import { useProperties } from '@hooks/api/useProperties';
import {
  DEFAULT_PROPERTIES_FILTER,
  type PropertiesFilter,
} from '@app-types/property.types';
import Button from '@components/ui/button/Button';

export default function PropertiesPage() {
  const [filter, setFilter] = useState<PropertiesFilter>(DEFAULT_PROPERTIES_FILTER);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNewPropertyOpen, setIsNewPropertyOpen] = useState(false);

  const { data: properties, isLoading, error } = useProperties(filter);

  return (
    <>
      <PageMeta
        title="Properties | Quest"
        description="Manage your real estate investment properties"
      />

      <PageBreadcrumb pageTitle="Properties" />

      <div className="space-y-6">
        {/* Header with New Property Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Properties
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {properties?.length ?? 0} properties found
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsNewPropertyOpen(true)}
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Property
          </Button>
        </div>

        {/* New Property Modal */}
        <NewPropertyModal
          isOpen={isNewPropertyOpen}
          onClose={() => setIsNewPropertyOpen(false)}
        />

        {/* Filter */}
        <PropertyFilter
          filter={filter}
          onFilterChange={setFilter}
          isOpen={isFilterOpen}
          onToggle={() => setIsFilterOpen(!isFilterOpen)}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">
              Error loading properties. Please try again.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && properties?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg
              className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <h3 className="mb-1 text-lg font-medium text-gray-800 dark:text-white/90">
              No properties found
            </h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Click "New Property" to add your first property, or adjust your filter settings.
            </p>
            <Button size="sm" onClick={() => setIsNewPropertyOpen(true)}>
              Add Property
            </Button>
          </div>
        )}

        {/* Properties Grid */}
        {!isLoading && !error && properties && properties.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
