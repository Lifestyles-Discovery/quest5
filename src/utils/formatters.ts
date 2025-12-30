/**
 * Formatting utilities for displaying and parsing values in the UI.
 */

/**
 * Format a number as currency (USD)
 * @example formatCurrency(425000) → "$425,000"
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '-';
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
  if (value == null) return '-';
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Format a number as a percentage
 * @example formatPercent(7.125) → "7.125%"
 */
export function formatPercent(value: number | null | undefined, decimals = 3): string {
  if (value == null) return '-';
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
  if (value == null) return '-';
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
