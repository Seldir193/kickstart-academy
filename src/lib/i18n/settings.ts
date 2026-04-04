export const supportedLanguages = ["de", "en", "tr"] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export const defaultLanguage: SupportedLanguage = "de";

export const languageLabels: Record<SupportedLanguage, string> = {
  de: "Deutsch",
  en: "English",
  tr: "Türkçe",
};
