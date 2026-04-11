import { createContext, useContext } from 'react';
import en, { type TranslationKeys } from './en';
import ru from './ru';

export type Lang = 'en' | 'ru';

const translations: Record<Lang, Record<TranslationKeys, string>> = { en, ru };

export function getStoredLang(): Lang {
  return (localStorage.getItem('brabble_lang') as Lang) || 'en';
}

export function setStoredLang(lang: Lang) {
  localStorage.setItem('brabble_lang', lang);
}

export type TFunction = (key: TranslationKeys, params?: Record<string, string | number>) => string;

export function createT(lang: Lang): TFunction {
  const dict = translations[lang] || en;
  return (key, params) => {
    let str = dict[key] ?? en[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(`{${k}}`, String(v));
      }
    }
    return str;
  };
}

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TFunction;
}

export const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  setLang: () => {},
  t: createT('en'),
});

export function useTranslation() {
  return useContext(I18nContext);
}
