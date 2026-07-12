import { TRANSLATIONS } from "./dashboardConstants";

/**
 * Resolves a translation key based on user language settings.
 */
export const getTranslation = (language: string, key: string): string => {
  return TRANSLATIONS[language]?.[key] || TRANSLATIONS["en"]?.[key] || key;
};
export default getTranslation;
