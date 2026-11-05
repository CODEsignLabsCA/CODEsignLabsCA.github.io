import { ui, defaultLang } from "./ui";

export type Locale = keyof typeof ui;
export type TranslationKey = keyof (typeof ui)[typeof defaultLang];

export function useTranslations(lang: Locale) {
  return function t(key: TranslationKey): string {
    return ui[lang][key] || ui[defaultLang][key];
  };
}
