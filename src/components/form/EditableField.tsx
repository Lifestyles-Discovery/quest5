import { useRef, useLayoutEffect } from 'react';
import { useEditableField } from '@/hooks/useEditableField';
import {
  formatCurrency,
  formatCurrencyInput,
  getCurrencyInputCursorPosition,
  formatNumber,
  formatPercent,
  formatDecimal,
  formatWithSuffix,
  parseCurrency,
  parseNumber,
  parsePercent,
} from '@/utils/formatters';

export type EditableFieldFormat =
  | 'currency'
  | 'number'
  | 'percent'
  | 'decimal'
  | 'year'
  | 'text';

interface EditableFieldProps {
  /** Label displayed above the value */
  label: string;
  /** Current value */
  value: number | string;
  /** Called when value is saved - can be async for error handling */
  onSave: (value: number | string) => void | Promise<void>;
  /** How to format the display value */
  format?: EditableFieldFormat;
  /** Suffix to append to display (e.g., " beds", " sqft") */
  suffix?: string;
  /** Prefix to show before value (mainly for currency in edit mode) */
  prefix?: string;
  /** Input step for number inputs */
  step?: number;
  /** Input type override */
  type?: 'number' | 'text';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional class name for container */
  className?: string;
  /** Debounce delay in ms (default: 0) */
  debounceMs?: number;
  /** Helper text displayed below the value */
  hint?: string;
}

/**
 * Click-to-edit field component following 37signals philosophy.
 *
 * Displays a formatted value that becomes editable on click.
 * Auto-saves on blur or Enter, cancels on Escape.
 */
export function EditableField({
  label,
  value,
  onSave,
  format = 'text',
  suffix,
  prefix,
  step = 1,
  type,
  size = 'md',
  className = '',
  debounceMs = 0,
  hint,
}: EditableFieldProps) {
  // Determine input type based on format
  // Currency uses 'text' to allow $ and comma formatting while typing
  const inputType = type ?? (format === 'text' || format === 'currency' ? 'text' : 'number');

  // Track cursor position for currency input formatting
  const cursorPositionRef = useRef<number | null>(null);
  const localInputRef = useRef<HTMLInputElement>(null);

  // Get parser function based on format
  const getParser = () => {
    switch (format) {
      case 'currency':
        return (v: string) => parseCurrency(v);
      case 'percent':
        return (v: string) => parsePercent(v);
      case 'number':
      case 'decimal':
      case 'year':
        return (v: string) => parseNumber(v);
      default:
        return (v: string) => v;
    }
  };

  const {
    isEditing,
    inputValue,
    setInputValue,
    startEditing,
    handleBlur,
    handleKeyDown,
    inputRef,
    isSaving,
    justSaved,
    hasError,
  } = useEditableField({
    value,
    onSave,
    debounceMs,
    parseValue: getParser(),
  });

  // Restore cursor position after currency formatting
  useLayoutEffect(() => {
    if (format === 'currency' && cursorPositionRef.current !== null && localInputRef.current) {
      localInputRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
      cursorPositionRef.current = null;
    }
  }, [inputValue, format]);

  // Handle currency input change with formatting
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawValue = input.value;
    const cursor = input.selectionStart ?? 0;
    const newValue = formatCurrencyInput(rawValue);

    // Calculate new cursor position based on digit count in raw input
    cursorPositionRef.current = getCurrencyInputCursorPosition(rawValue, newValue, cursor);
    setInputValue(newValue);
  };

  // Format the display value
  // When saving, use inputValue to avoid flicker back to old value while API responds
  const getDisplayValue = (): string => {
    const displaySource = isSaving ? getParser()(inputValue) : value;
    const numValue = typeof displaySource === 'number' ? displaySource : parseFloat(String(displaySource));

    switch (format) {
      case 'currency':
        return suffix
          ? `${formatCurrency(numValue)}${suffix}`
          : formatCurrency(numValue);
      case 'number':
        return suffix
          ? formatWithSuffix(numValue, suffix)
          : formatNumber(numValue);
      case 'percent':
        return formatPercent(numValue);
      case 'decimal':
        return suffix
          ? `${formatDecimal(numValue)}${suffix}`
          : formatDecimal(numValue);
      case 'year':
        return String(numValue || '-');
      case 'text':
      default:
        return String(displaySource || '-');
    }
  };

  // Size classes
  const sizeClasses = {
    sm: {
      label: 'text-xs',
      value: 'text-sm',
      input: 'px-2 py-1 text-sm',
    },
    md: {
      label: 'text-xs',
      value: 'text-base',
      input: 'px-2 py-1.5 text-sm',
    },
    lg: {
      label: 'text-sm',
      value: 'text-lg',
      input: 'px-3 py-2 text-base',
    },
    xl: {
      label: 'text-sm',
      value: 'text-xl',
      input: 'px-3 py-2.5 text-lg',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={className}>
      <label className={`block font-medium text-gray-500 dark:text-gray-400 ${sizes.label}`}>
        {label}
      </label>

      {isEditing ? (
        <div className="mt-1 flex items-center">
          {prefix && format !== 'currency' && (
            <span className="mr-1 text-sm text-gray-500 dark:text-gray-400">
              {prefix}
            </span>
          )}
          <input
            ref={(el) => {
              // Set both refs for currency (local for cursor, hook for focus)
              if (format === 'currency') {
                localInputRef.current = el;
              }
              if (inputRef && typeof inputRef === 'object') {
                (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
              }
            }}
            type={inputType}
            inputMode={format === 'currency' ? 'numeric' : undefined}
            step={format !== 'currency' ? step : undefined}
            value={format === 'currency' ? (inputValue.startsWith('$') ? inputValue : formatCurrencyInput(inputValue || String(value))) : inputValue}
            onChange={format === 'currency' ? handleCurrencyChange : (e) => setInputValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`
              block w-full rounded border border-gray-300
              focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary
              dark:border-gray-600 dark:bg-gray-700 dark:text-white
              ${sizes.input}
            `}
          />
        </div>
      ) : (
        <div
          onClick={startEditing}
          onFocus={startEditing}
          className={`
            mt-1 flex cursor-pointer items-center rounded px-1 -mx-1
            font-semibold text-gray-900 dark:text-white
            hover:bg-gray-100 dark:hover:bg-gray-700/50
            transition-colors
            ${sizes.value}
            ${hasError ? 'bg-red-50 dark:bg-red-900/20' : ''}
          `}
          role="button"
          tabIndex={0}
        >
          <span className={`flex-1 ${hasError ? 'text-red-600 dark:text-red-400' : ''}`}>
            {getDisplayValue()}
          </span>
          {justSaved && (
            <svg
              className="ml-2 h-4 w-4 text-green-500"
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
              className="ml-2 h-4 w-4 text-red-500"
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
      )}
      {hint && (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>
      )}
    </div>
  );
}

export default EditableField;
