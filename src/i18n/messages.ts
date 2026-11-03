import account from './dictionaries/account';
import academy from './dictionaries/academy';
import common from './dictionaries/common';
import community from './dictionaries/community';
import dashboard from './dictionaries/dashboard';
import data from './dictionaries/data';
import landing from './dictionaries/landing';
import suppliers from './dictionaries/suppliers';

/**
 * Malay translations keyed by the exact English source string used in the
 * interface. English is the source of truth in code; this map is applied when
 * the selected language is Malay. A missing key falls back to English, so new
 * copy never breaks the page — it just needs a translation added here.
 */
export const messages: Record<string, string> = {
  ...common,
  ...data,
  ...landing,
  ...dashboard,
  ...suppliers,
  ...academy,
  ...community,
  ...account,
};
