const DEFAULT_LOCALE = 'en-US';

/**
 * Gets the current user's locale identifier.
 * This implementation can be customized for your application's needs.
 *
 * For this example, it checks for a global variable `window.__localeId__`
 * (as suggested in the docs) and falls back to the browser's language.
 *
 * @returns {string} The locale identifier (e.g., 'en-US', 'es').
 */
export function getCurrentLocaleId() {
  if (typeof window !== 'undefined') {
    return window.__localeId__ || navigator.language;
  }
  // Final fallback for server-side rendering or other non-browser environments.
  return DEFAULT_LOCALE;
}
