/**
 * Formatting utilities for displaying and parsing values in the UI.
 */

/**
 * Format a number as currency (USD)
 * @example formatCurrency(425000) → "$425,000"
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null || typeof value !== 'number' || !isFinite(value)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number with thousand separators
 * @example formatNumber(2100) → "2,100"
 */
export function formatNumber(value: number | null | undefined): string {
  if (value == null || typeof value !== 'number' || !isFinite(value)) return '-';
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Format a number as a percentage
 * @example formatPercent(7.125) → "7.125%"
 */
export function formatPercent(value: number | null | undefined, decimals = 3): string {
  if (value == null || typeof value !== 'number' || !isFinite(value)) return '-';
  return `${value.toFixed(decimals).replace(/\.?0+$/, '')}%`;
}

/**
 * Format a number with a suffix
 * @example formatWithSuffix(3, ' beds') → "3 beds"
 * @example formatWithSuffix(2100, ' sqft') → "2,100 sqft"
 */
export function formatWithSuffix(
  value: number | null | undefined,
  suffix: string,
  useThousandSeparator = true
): string {
  if (value == null) return '-';
  const formatted = useThousandSeparator
    ? new Intl.NumberFormat('en-US').format(value)
    : String(value);
  return `${formatted}${suffix}`;
}

/**
 * Format a decimal number (preserves decimal places)
 * @example formatDecimal(2.5) → "2.5"
 */
export function formatDecimal(value: number | null | undefined): string {
  if (value == null || typeof value !== 'number' || !isFinite(value)) return '-';
  return String(value);
}

/**
 * Parse a currency string to a number
 * @example parseCurrency("$425,000") → 425000
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[$,]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse a number string (removes thousand separators)
 * @example parseNumber("2,100") → 2100
 */
export function parseNumber(value: string): number {
  const cleaned = value.replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse a percentage string
 * @example parsePercent("7.125%") → 7.125
 */
export function parsePercent(value: string): number {
  const cleaned = value.replace(/%/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format a string as currency while typing (for live input formatting)
 * Strips non-digits, adds $ prefix and thousand separators
 * @example formatCurrencyInput("1234") → "$1,234"
 * @example formatCurrencyInput("$1,234") → "$1,234"
 * @example formatCurrencyInput("") → ""
 */
export function formatCurrencyInput(value: string): string {
  // Remove everything except digits
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  // Format with $ and commas
  return '$' + Number(digits).toLocaleString('en-US');
}

/**
 * Get the cursor position after formatting a currency input
 * @param rawInputValue The raw input value (before formatting)
 * @param formattedValue The formatted value (after formatting)
 * @param rawCursor Cursor position in the raw input value
 */
export function getCurrencyInputCursorPosition(
  rawInputValue: string,
  formattedValue: string,
  rawCursor: number
): number {
  // Count digits before cursor in raw input
  const digitsBeforeCursor = rawInputValue.slice(0, rawCursor).replace(/\D/g, '').length;

  // Find position in formatted value where we have the same number of digits
  let digitCount = 0;
  for (let i = 0; i < formattedValue.length; i++) {
    if (/\d/.test(formattedValue[i])) {
      digitCount++;
    }
    if (digitCount === digitsBeforeCursor) {
      return i + 1;
    }
  }

  return formattedValue.length;
}
