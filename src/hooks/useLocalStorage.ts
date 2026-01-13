import { useState, useCallback } from 'react';

/**
 * Hook for managing a boolean value persisted in localStorage
 */
export function useLocalStorageBoolean(
  key: string,
  defaultValue = false
): [boolean, () => void] {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored !== null ? stored === 'true' : defaultValue;
  });

  const toggle = useCallback(() => {
    setValue((prev) => {
      const newValue = !prev;
      localStorage.setItem(key, newValue.toString());
      return newValue;
    });
  }, [key]);

  return [value, toggle];
}
