import { useState, useMemo } from 'react';
import PageMeta from '@components/common/PageMeta';
import PageBreadcrumb from '@components/common/PageBreadCrumb';
import { PropertyCard } from '../components/PropertyCard';
import { StageTabsFilter } from '../components/StageTabsFilter';
import { NewPropertyModal } from '../components/NewPropertyModal';
import { useProperties } from '@hooks/api/useProperties';
import {
  STAGE_TAB_GROUPS,
  PROPERTY_STAGES,
  type StageTabKey,
  type PropertiesFilter,
} from '@app-types/property.types';
import Button from '@components/ui/button/Button';
import Input from '@components/form/input/InputField';

const PROPERTIES_PER_PAGE = 6;

export default function PropertiesPage() {
  const [activeTab, setActiveTab] = useState<StageTabKey>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewPropertyOpen, setIsNewPropertyOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Build filter from tab and search
  const filter: PropertiesFilter = useMemo(
    () => ({
      searchTerm,
      stages: STAGE_TAB_GROUPS[activeTab].stages as typeof PROPERTY_STAGES,
      useDates: false,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    }),
    [activeTab, searchTerm]
  );

  const { data: properties, isLoading, error } = useProperties(filter);

  // Pagination calculations
  const totalProperties = properties?.length ?? 0;
  const totalPages = Math.ceil(totalProperties / PROPERTIES_PER_PAGE);
  const startIndex = (currentPage - 1) * PROPERTIES_PER_PAGE;
  const paginatedProperties = properties?.slice(startIndex, startIndex + PROPERTIES_PER_PAGE);

  // Reset to page 1 when filter changes
  const handleTabChange = (tab: StageTabKey) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  return (
    <>
      <PageMeta
        title="Deals | Quest"
        description="Manage your real estate investment deals"
      />

      <PageBreadcrumb pageTitle="Deals" />

      <div className="space-y-6">
        {/* Header with New Deal Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Deals
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {properties?.length ?? 0} deal{properties?.length !== 1 ? 's' : ''} found
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
            New Deal
          </Button>
        </div>

        {/* New Property Modal */}
        <NewPropertyModal
          isOpen={isNewPropertyOpen}
          onClose={() => setIsNewPropertyOpen(false)}
        />

        {/* Stage Tabs and Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <StageTabsFilter activeTab={activeTab} onTabChange={handleTabChange} />
          <div className="w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>

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
              No deals yet
            </h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Add your first deal to start evaluating.
            </p>
            <Button size="sm" onClick={() => setIsNewPropertyOpen(true)}>
              Add Deal
            </Button>
          </div>
        )}

        {/* Properties Grid */}
        {!isLoading && !error && paginatedProperties && paginatedProperties.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {startIndex + 1}-{Math.min(startIndex + PROPERTIES_PER_PAGE, totalProperties)} of {totalProperties} deals
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
