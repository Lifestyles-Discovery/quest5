import { useState, useRef, useCallback, useEffect } from 'react';
import type React from 'react';
import type { FC } from 'react';

interface AutoSaveCheckboxProps {
  label?: string;
  checked: boolean;
  onSave: (checked: boolean) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

const AutoSaveCheckbox: FC<AutoSaveCheckboxProps> = ({
  label,
  checked,
  onSave,
  disabled = false,
  className = '',
}) => {
  const [currentChecked, setCurrentChecked] = useState(checked);
  const [justSaved, setJustSaved] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track the value we just saved to prevent syncing back to stale external value
  const pendingSavedValueRef = useRef<boolean | null>(null);

  // Sync from external value changes (when not saving)
  useEffect(() => {
    if (!isSaving) {
      // If we have a pending saved value, wait for external to catch up
      if (pendingSavedValueRef.current !== null) {
        if (checked === pendingSavedValueRef.current) {
          // External value caught up, clear pending
          pendingSavedValueRef.current = null;
        } else {
          // External still stale, keep our saved value
          return;
        }
      } else {
        // No pending save, sync normally
        setCurrentChecked(checked);
      }
    }
  }, [checked, isSaving]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;
      setCurrentChecked(newChecked);
      setIsSaving(true);
      setHasError(false);

      try {
        await onSave(newChecked);
        // Mark this value as pending until external value catches up
        pendingSavedValueRef.current = newChecked;
        setIsSaving(false);
        setJustSaved(true);

        feedbackTimeoutRef.current = setTimeout(() => {
          setJustSaved(false);
        }, 2000);
      } catch {
        setIsSaving(false);
        setHasError(true);
        // Revert to original value on error
        setCurrentChecked(checked);

        errorTimeoutRef.current = setTimeout(() => {
          setHasError(false);
        }, 3000);
      }
    },
    [checked, onSave]
  );

  let borderClasses = 'border-gray-300 dark:border-gray-700';
  if (hasError) {
    borderClasses = 'border-error-500 dark:border-error-500';
  } else if (justSaved) {
    borderClasses = 'border-success-500 dark:border-success-500';
  }

  return (
    <label
      className={`flex items-center space-x-3 group cursor-pointer ${
        disabled || isSaving ? 'cursor-not-allowed opacity-60' : ''
      }`}
    >
      <div className="relative w-7 h-7">
        <input
          type="checkbox"
          className={`w-7 h-7 appearance-none cursor-pointer border ${borderClasses} checked:border-transparent rounded-md checked:bg-brand-500 disabled:opacity-60 ${className}`}
          checked={currentChecked}
          onChange={handleChange}
          disabled={disabled || isSaving}
        />
        {currentChecked && (
          <svg
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none top-1/2 left-1/2"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
              stroke="white"
              strokeWidth="1.94437"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      {label && (
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
          {label}
          {/* Feedback icons */}
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
        </span>
      )}
    </label>
  );
};

export default AutoSaveCheckbox;
