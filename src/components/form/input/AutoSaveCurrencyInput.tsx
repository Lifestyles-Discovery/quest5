import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import type React from 'react';
import type { FC } from 'react';
import {
  formatCurrencyInput,
  getCurrencyInputCursorPosition,
  parseCurrency,
} from '@/utils/formatters';

interface AutoSaveCurrencyInputProps {
  value: number;
  onSave: (value: number) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

const AutoSaveCurrencyInput: FC<AutoSaveCurrencyInputProps> = ({
  value,
  onSave,
  disabled = false,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(() =>
    value != null ? formatCurrencyInput(String(value)) : ''
  );
  const [justSaved, setJustSaved] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const originalValueRef = useRef(value);
  const cursorPositionRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancellingRef = useRef(false);
  // Track the value we just saved to prevent syncing back to stale external value
  const pendingSavedValueRef = useRef<number | null>(null);

  // Sync from external value changes (when not saving)
  useEffect(() => {
    if (!isSaving) {
      // If we have a pending saved value, wait for external to catch up
      if (pendingSavedValueRef.current !== null) {
        if (value === pendingSavedValueRef.current) {
          // External value caught up, clear pending
          pendingSavedValueRef.current = null;
          originalValueRef.current = value;
        } else {
          // External still stale, keep our saved value
          return;
        }
      } else {
        // No pending save, sync normally
        const formatted = value != null ? formatCurrencyInput(String(value)) : '';
        setDisplayValue(formatted);
        originalValueRef.current = value;
      }
    }
  }, [value, isSaving]);

  // Restore cursor position after formatting
  useLayoutEffect(() => {
    if (cursorPositionRef.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
      cursorPositionRef.current = null;
    }
  }, [displayValue]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawValue = input.value;
    const cursor = input.selectionStart ?? 0;
    const newValue = formatCurrencyInput(rawValue);

    cursorPositionRef.current = getCurrencyInputCursorPosition(rawValue, newValue, cursor);
    setDisplayValue(newValue);
  };

  const handleBlur = useCallback(async () => {
    // Skip save if user pressed Escape
    if (cancellingRef.current) {
      cancellingRef.current = false;
      return;
    }

    const parsedValue = parseCurrency(displayValue);

    // Only save if value actually changed
    if (parsedValue !== originalValueRef.current) {
      setIsSaving(true);
      setHasError(false);

      try {
        await onSave(parsedValue);
        // Mark this value as pending until external value catches up
        pendingSavedValueRef.current = parsedValue;
        originalValueRef.current = parsedValue;
        setIsSaving(false);
        setJustSaved(true);

        feedbackTimeoutRef.current = setTimeout(() => {
          setJustSaved(false);
        }, 2000);
      } catch {
        setIsSaving(false);
        setHasError(true);

        errorTimeoutRef.current = setTimeout(() => {
          setHasError(false);
        }, 3000);
      }
    }
  }, [displayValue, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        (e.target as HTMLInputElement).blur();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancellingRef.current = true;
        setDisplayValue(formatCurrencyInput(String(originalValueRef.current)));
        (e.target as HTMLInputElement).blur();
      }
    },
    []
  );

  let inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${className}`;

  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (hasError) {
    inputClasses += ` border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800`;
  } else if (justSaved) {
    inputClasses += ` border-success-500 focus:border-success-300 focus:ring-success-500/20 dark:text-success-400 dark:border-success-500 dark:focus:border-success-800`;
  } else {
    inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800`;
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled || isSaving}
        className={inputClasses}
      />
      {/* Feedback icons */}
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
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

export default AutoSaveCurrencyInput;
