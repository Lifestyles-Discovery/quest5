import { STAGE_TAB_GROUPS, type StageTabKey } from '@app-types/property.types';

interface StageTabsFilterProps {
  activeTab: StageTabKey;
  onTabChange: (tab: StageTabKey) => void;
  counts?: Partial<Record<StageTabKey, number>>;
}

/**
 * StageTabsFilter - Visual tabs for filtering properties by stage groups.
 *
 * Replaces the multi-select checkbox filter with a simpler tab interface.
 * Shows 4 tabs: All, Active, In Progress, Managing
 */
export function StageTabsFilter({ activeTab, onTabChange, counts }: StageTabsFilterProps) {
  const tabs = Object.entries(STAGE_TAB_GROUPS) as [StageTabKey, (typeof STAGE_TAB_GROUPS)[StageTabKey]][];

  return (
    <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
      {tabs.map(([key, { label }]) => {
        const count = counts?.[key];
        const isActive = activeTab === key;

        return (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-white text-gray-800 shadow dark:bg-gray-700 dark:text-white'
                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            {label}
            {count !== undefined && (
              <span
                className={`text-xs ${
                  isActive ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                ({count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
