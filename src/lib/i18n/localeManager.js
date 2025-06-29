import { enUS } from 'date-fns/locale';

// A cache for dynamically loaded locales to avoid re-fetching.
const loadedLocales = {
  'en-US': enUS,
};

// Define the locales your application supports. This helps with bundler
// optimizations, as shown in the webpack.md documentation.
export const SUPPORTED_LOCALES = ['en-US', 'de', 'es', 'fr', 'ja', 'ru'];
const DEFAULT_LOCALE = 'en-US';

/**
 * Dynamically loads a date-fns locale object.
 * It falls back to en-US if the requested locale is not supported or fails to load.
 *
 * @param {string} localeId - The locale identifier (e.g., 'es', 'fr-CA').
 * @returns {Promise<import('date-fns').Locale>} A promise that resolves to the date-fns locale object.
 */
export async function getLocale(localeId) {
  // Use the primary language subtag (e.g., 'es' from 'es-ES')
  const baseLocale = (localeId || '').split('-')[0];

  // If we got an empty string, fall back
  if (!baseLocale) {
    return loadedLocales[DEFAULT_LOCALE];
  }

  const targetLocale = SUPPORTED_LOCALES.includes(baseLocale)
    ? baseLocale
    : DEFAULT_LOCALE;

  if (loadedLocales[targetLocale]) {
    loadedLocales[localeId] = loadedLocales[targetLocale]; // Cache with original key
    return loadedLocales[targetLocale];
  }

  try {
    const localeModule = await import(`date-fns/locale/${targetLocale}`);
    loadedLocales[targetLocale] = localeModule.default;
    loadedLocales[localeId] = localeModule.default; // Cache with both keys
    return localeModule.default;
  } catch (error) {
    console.error(
      `Failed to load locale "${targetLocale}", falling back to ${DEFAULT_LOCALE}.`,
      error,
    );
    return loadedLocales[DEFAULT_LOCALE];
  }
}
