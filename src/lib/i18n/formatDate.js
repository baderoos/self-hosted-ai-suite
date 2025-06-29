import { format } from 'date-fns';
import { getLocale } from './localeManager';
import { getCurrentLocaleId } from './getCurrentLocale';

/**
 * A reusable wrapper for date-fns' `format` function that automatically
 * handles the current user's locale.
 *
 * It dynamically loads and caches locales to keep the initial bundle size small.
 *
 * @param {Date|number} date - The date to format.
 * @param {string} formatString - The string of tokens to format the date with (e.g., 'PPPP', 'yyyy-MM-dd').
 * @param {object} [options] - Additional options to pass to the original `format` function.
 * @returns {Promise<string>} A promise that resolves with the formatted date string.
 */
export async function formatDate(date, formatString, options = {}) {
  const localeId = getCurrentLocaleId();
  const locale = await getLocale(localeId);

  return format(date, formatString, {
    ...options,
    locale,
  });
}
