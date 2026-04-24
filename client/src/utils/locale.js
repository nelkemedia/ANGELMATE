export const SUPPORTED_LOCALES = ['de', 'en', 'fr'];

export function toLocaleTag(lang) {
  return { de: 'de-DE', en: 'en-GB', fr: 'fr-FR' }[lang] ?? 'de-DE';
}

export function detectLang(user) {
  if (user?.language && SUPPORTED_LOCALES.includes(user.language)) return user.language;
  const stored = localStorage.getItem('am_lang');
  if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;
  const browser = (navigator.language || '').slice(0, 2).toLowerCase();
  if (SUPPORTED_LOCALES.includes(browser)) return browser;
  return 'de';
}
