import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { detectLang, SUPPORTED_LOCALES } from '../utils/locale';

const TranslationContext = createContext(null);

export function TranslationProvider({ children }) {
  const { user } = useAuth();
  const [locale, setLocale] = useState(() => detectLang(null));
  const [translations, setTranslations] = useState({});
  const [ready, setReady] = useState(false);

  const fetchTranslations = useCallback(async (lang) => {
    try {
      const res = await fetch(`/api/translations?locale=${lang}`);
      const data = await res.json();
      setTranslations(data.translations ?? {});
      localStorage.setItem('am_lang', lang);
    } catch {
      // fall through — t() will return keys as fallback
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    const lang = detectLang(user);
    setLocale(lang);
    fetchTranslations(lang);
  }, [user?.language, fetchTranslations]);

  function changeLocale(lang) {
    if (!SUPPORTED_LOCALES.includes(lang)) return;
    setLocale(lang);
    fetchTranslations(lang);
  }

  function t(key, vars = {}) {
    let s = translations[key] ?? key;
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{{${k}}}`, String(v ?? ''));
    }
    return s;
  }

  return (
    <TranslationContext.Provider value={{ locale, changeLocale, t, ready, refetch: () => fetchTranslations(locale) }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useT() {
  return useContext(TranslationContext);
}
