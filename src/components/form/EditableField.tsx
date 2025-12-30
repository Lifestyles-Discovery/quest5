import { useEditableField } from '@/hooks/useEditableField';
import {
  formatCurrency,
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
  size?: 'sm' | 'md' | 'lg';
  /** Additional class name for container */
  className?: string;
  /** Debounce delay in ms (default: 0) */
  debounceMs?: number;
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
}: EditableFieldProps) {
  // Determine input type based on format
  const inputType = type ?? (format === 'text' ? 'text' : 'number');

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
    justSaved,
    hasError,
  } = useEditableField({
    value,
    onSave,
    debounceMs,
    parseValue: getParser(),
  });

  // Format the display value
  const getDisplayValue = (): string => {
    const numValue = typeof value === 'number' ? value : parseFloat(String(value));

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
        return String(value || '-');
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
  };

  const sizes = sizeClasses[size];

  return (
    <div className={className}>
      <label className={`block font-medium text-gray-500 dark:text-gray-400 ${sizes.label}`}>
        {label}
      </label>

      {isEditing ? (
        <div className="mt-1 flex items-center">
          {prefix && (
            <span className="mr-1 text-sm text-gray-500 dark:text-gray-400">
              {prefix}
            </span>
          )}
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={inputType}
            step={step}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
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
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              startEditing();
            }
          }}
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
    </div>
  );
}

export default EditableField;
