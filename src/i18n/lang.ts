export type Lang = 'ms' | 'en';

export const DEFAULT_LANG: Lang = 'ms';
export const LANG_STORAGE_KEY = 'halalniaga.lang';

/**
 * Active language for non-React helpers (dates, numbers). The provider keeps
 * this in sync so formatting follows the same language as the interface.
 */
let activeLang: Lang = DEFAULT_LANG;

export const setActiveLang = (lang: Lang): void => {
  activeLang = lang;
};

export const getActiveLang = (): Lang => activeLang;

export const dateLocale = (lang: Lang = activeLang): string =>
  lang === 'ms' ? 'ms-MY' : 'en-GB';

export const numberLocale = (lang: Lang = activeLang): string =>
  lang === 'ms' ? 'ms-MY' : 'en-GB';
