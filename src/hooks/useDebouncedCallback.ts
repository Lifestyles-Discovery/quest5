import { useCallback, useRef, useEffect } from 'react';

/**
 * A stable debounced callback hook that:
 * - Does NOT recreate on dependency changes (uses refs internally)
 * - Cleans up properly on unmount
 * - Provides a cancel function for manual cancellation
 *
 * @param callback The function to debounce
 * @param delay Delay in milliseconds
 * @returns [debouncedFn, cancel] - The debounced function and a cancel function
 */
export function useDebouncedCallback<T extends (...args: never[]) => void>(
  callback: T,
  delay: number
): [(...args: Parameters<T>) => void, () => void] {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date without triggering re-renders
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      // Cancel any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Schedule new call
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  return [debouncedFn, cancel];
}
