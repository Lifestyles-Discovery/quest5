import { useState, useRef, useCallback, useEffect } from 'react';
import type React from 'react';
import type { FC, ReactNode } from 'react';

interface AutoSaveSelectProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

const AutoSaveSelect: FC<AutoSaveSelectProps> = ({
  value,
  onSave,
  disabled = false,
  className = '',
  children,
}) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [justSaved, setJustSaved] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track the value we just saved to prevent syncing back to stale external value
  const pendingSavedValueRef = useRef<string | null>(null);

  // Sync from external value changes (when not saving)
  useEffect(() => {
    if (!isSaving) {
      // If we have a pending saved value, wait for external to catch up
      if (pendingSavedValueRef.current !== null) {
        if (value === pendingSavedValueRef.current) {
          // External value caught up, clear pending
          pendingSavedValueRef.current = null;
        } else {
          // External still stale, keep our saved value
          return;
        }
      } else {
        // No pending save, sync normally
        setCurrentValue(value);
      }
    }
  }, [value, isSaving]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = e.target.value;
      setCurrentValue(newValue);

      // Only save if value actually changed
      if (newValue !== value) {
        setIsSaving(true);
        setHasError(false);

        try {
          await onSave(newValue);
          // Mark this value as pending until external value catches up
          pendingSavedValueRef.current = newValue;
          setIsSaving(false);
          setJustSaved(true);

          feedbackTimeoutRef.current = setTimeout(() => {
            setJustSaved(false);
          }, 2000);
        } catch {
          setIsSaving(false);
          setHasError(true);
          // Revert to original value on error
          setCurrentValue(value);

          errorTimeoutRef.current = setTimeout(() => {
            setHasError(false);
          }, 3000);
        }
      }
    },
    [value, onSave]
  );

  let selectClasses = `h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-3 dark:text-white/90 ${className}`;

  if (disabled || isSaving) {
    selectClasses += ` border-gray-300 opacity-40 cursor-not-allowed dark:border-gray-700`;
  } else if (hasError) {
    selectClasses += ` border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:border-error-500`;
  } else if (justSaved) {
    selectClasses += ` border-success-500 focus:border-success-300 focus:ring-success-500/20 dark:border-success-500`;
  } else {
    selectClasses += ` border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700`;
  }

  return (
    <div className="relative">
      <select
        value={currentValue}
        onChange={handleChange}
        disabled={disabled || isSaving}
        className={selectClasses}
      >
        {children}
      </select>
      {/* Feedback icons */}
      <div className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2">
        {justSaved && (
          <svg
            className="h-4 w-4 text-success-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
        {hasError && (
          <svg
            className="h-4 w-4 text-error-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export default AutoSaveSelect;
