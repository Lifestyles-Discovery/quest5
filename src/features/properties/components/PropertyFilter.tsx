import { useState } from 'react';
import Input from '@components/form/input/InputField';
import Checkbox from '@components/form/input/Checkbox';
import Label from '@components/form/Label';
import Button from '@components/ui/button/Button';
import {
  PROPERTY_STAGES,
  type PropertiesFilter,
  type PropertyStage,
} from '@app-types/property.types';

interface PropertyFilterProps {
  filter: PropertiesFilter;
  onFilterChange: (filter: PropertiesFilter) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function PropertyFilter({
  filter,
  onFilterChange,
  isOpen,
  onToggle,
}: PropertyFilterProps) {
  const [localFilter, setLocalFilter] = useState(filter);

  const handleStageToggle = (stage: PropertyStage) => {
    const newStages = localFilter.stages.includes(stage)
      ? localFilter.stages.filter((s) => s !== stage)
      : [...localFilter.stages, stage];
    setLocalFilter({ ...localFilter, stages: newStages });
  };

  const handleSelectAllStages = () => {
    setLocalFilter({ ...localFilter, stages: [...PROPERTY_STAGES] });
  };

  const handleClearAllStages = () => {
    setLocalFilter({ ...localFilter, stages: [] });
  };

  const handleApply = () => {
    onFilterChange(localFilter);
  };

  const handleReset = () => {
    const resetFilter: PropertiesFilter = {
      searchTerm: '',
      stages: [...PROPERTY_STAGES],
      useDates: false,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      skip: 0,
      take: 6,
    };
    setLocalFilter(resetFilter);
    onFilterChange(resetFilter);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Filter Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <span className="font-medium text-gray-800 dark:text-white/90">
          Filter Properties
        </span>
        <svg
          className={`h-5 w-5 transform text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Filter Content */}
      {isOpen && (
        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          {/* Search Term */}
          <div className="mb-4">
            <Label>Search</Label>
            <Input
              type="text"
              placeholder="Search by address, city, or zip..."
              value={localFilter.searchTerm}
              onChange={(e) =>
                setLocalFilter({ ...localFilter, searchTerm: e.target.value })
              }
            />
          </div>

          {/* Stages */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <Label>Stages</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllStages}
                  className="text-xs text-brand-500 hover:text-brand-600"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={handleClearAllStages}
                  className="text-xs text-brand-500 hover:text-brand-600"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {PROPERTY_STAGES.map((stage) => (
                <label
                  key={stage}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Checkbox
                    checked={localFilter.stages.includes(stage)}
                    onChange={() => handleStageToggle(stage)}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {stage}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Filter */}
          <div className="mb-4">
            <label className="mb-2 flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={localFilter.useDates}
                onChange={(checked) =>
                  setLocalFilter({ ...localFilter, useDates: checked })
                }
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by date range
              </span>
            </label>
            {localFilter.useDates && (
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={localFilter.startDate.toISOString().split('T')[0]}
                    onChange={(e) =>
                      setLocalFilter({
                        ...localFilter,
                        startDate: new Date(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={localFilter.endDate.toISOString().split('T')[0]}
                    onChange={(e) =>
                      setLocalFilter({
                        ...localFilter,
                        endDate: new Date(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleApply}>
              Apply Filter
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
