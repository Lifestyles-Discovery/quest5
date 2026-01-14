import { useLocalStorageBoolean } from '@/hooks/useLocalStorage';

export type HelpSection = 'deal-terms' | 'conventional' | 'hard-money' | 'comps';

/**
 * Hook for managing per-section help visibility
 * State is persisted to localStorage so it remembers user preference
 */
export function useHelpSection(section: HelpSection): [boolean, () => void] {
  return useLocalStorageBoolean(`quest-help-${section}`, false);
}
