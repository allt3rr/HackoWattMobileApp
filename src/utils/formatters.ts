/**
 * HackoWatt Type-Safe Formatters and Guards
 * Prevents runtime null/undefined/NaN crashes and guarantees valid React child rendering.
 */

/**
 * Coerces any value into a finite number, falling back to a default value.
 */
export function safeNumber(val: unknown, fallback: number = 0): number {
  if (typeof val === 'number') {
    return Number.isFinite(val) ? val : fallback;
  }
  if (typeof val === 'string' && val.trim().length > 0) {
    const parsed = Number(val);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

/**
 * Safely formats a number or numeric string to fixed decimal digits.
 * Guaranteed never to crash with `Cannot read property 'toFixed' of undefined`.
 */
export function safeToFixed(
  val: unknown,
  digits: number = 2,
  fallback: string = '0.00'
): string {
  if (val === null || val === undefined) {
    return fallback;
  }
  const num = safeNumber(val, NaN);
  if (Number.isNaN(num)) {
    return fallback;
  }
  return num.toFixed(digits);
}

/**
 * Safely formats currency values (e.g. "0.280 €", "+14.50 €").
 */
export function formatCurrency(
  val: unknown,
  digits: number = 2,
  symbol: string = '€',
  showPlus: boolean = false
): string {
  const num = safeNumber(val, 0);
  const formatted = num.toFixed(digits);
  const prefix = showPlus && num > 0 ? '+' : '';
  return `${prefix}${formatted} ${symbol}`;
}

/**
 * Safely formats energy in kWh (e.g. "12.4 kWh").
 */
export function formatKwh(val: unknown, digits: number = 1): string {
  const num = safeNumber(val, 0);
  return `${num.toFixed(digits)} kWh`;
}

/**
 * Safely formats percentage values (e.g. "42%").
 */
export function formatPercent(val: unknown, digits: number = 0): string {
  const num = safeNumber(val, 0);
  return `${num.toFixed(digits)}%`;
}

/**
 * Formats investment payback period handling nulls (e.g. if payback is unreachable).
 */
export function formatPaybackYears(years: number | null | undefined): string {
  if (years === null || years === undefined || !Number.isFinite(years) || years <= 0) {
    return 'Brak zwrotu';
  }
  if (years > 25) {
    return '> 25 lat';
  }
  return `${years.toFixed(1)} lat`;
}

/**
 * Extracts a numeric hour from either an hour number or a CurrentHourStatus object.
 */
export function extractHour(currentHour: unknown): number {
  if (typeof currentHour === 'number' && Number.isFinite(currentHour)) {
    return Math.floor(currentHour);
  }
  if (
    typeof currentHour === 'object' &&
    currentHour !== null &&
    'hour' in currentHour &&
    typeof (currentHour as { hour: unknown }).hour === 'number'
  ) {
    return Math.floor((currentHour as { hour: number }).hour);
  }
  return new Date().getHours();
}

/**
 * Returns a fallback string if the value is null, undefined, or empty.
 */
export function safeString(val: unknown, fallback: string = ''): string {
  if (typeof val === 'string') {
    return val;
  }
  if (val === null || val === undefined) {
    return fallback;
  }
  return String(val);
}
