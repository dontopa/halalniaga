import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_LANG,
  LANG_STORAGE_KEY,
  setActiveLang,
  type Lang,
} from './lang';
import { messages } from './messages';

const TITLES: Record<Lang, string> = {
  ms: 'HALALNiaga — Sumber dengan yakin. Hidang dengan pasti.',
  en: 'HALALNiaga — Source with confidence. Serve with certainty.',
};

const DESCRIPTIONS: Record<Lang, string> = {
  ms: 'HALALNiaga ialah ekosistem halal digital untuk peniaga makanan kecil: pembekal yang disahkan, latihan praktikal, rekod pembelian yang boleh dijejak dan rekod program yang boleh diimbas pelanggan. Perintis Sabah, 2026.',
  en: 'HALALNiaga is a digital halal ecosystem for small food vendors: verified suppliers, practical training, traceable purchases and a customer-scannable programme record. Sabah pilot, 2026.',
};

const readLang = (): Lang => {
  try {
    return localStorage.getItem(LANG_STORAGE_KEY) === 'en' ? 'en' : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
};

const interpolate = (
  template: string,
  vars?: Record<string, string | number>,
): string => {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
};

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const initial = readLang();
    setActiveLang(initial);
    return initial;
  });

  useEffect(() => {
    setActiveLang(lang);
    document.documentElement.lang = lang;
    document.title = TITLES[lang];
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', DESCRIPTIONS[lang]);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Storage may be unavailable in private mode; the session still works.
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    // Set synchronously so generated copy (dates, alerts) matches the new
    // language in the same render pass.
    setActiveLang(next);
    setLangState(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((current) => {
      const next = current === 'ms' ? 'en' : 'ms';
      setActiveLang(next);
      return next;
    });
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, toggleLang }),
    [lang, setLang, toggleLang],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
};

export const useLang = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLang must be used inside LanguageProvider');
  }
  return context;
};

export type Translate = (
  text: string,
  vars?: Record<string, string | number>,
) => string;

/** Translate a string using the current language. */
export const useT = (): Translate => {
  const { lang } = useLang();
  return useCallback<Translate>(
    (text, vars) => interpolate(lang === 'ms' ? messages[text] ?? text : text, vars),
    [lang],
  );
};
