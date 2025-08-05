import { useTranslation as useI18nextTranslation } from 'react-i18next';

export function useTranslation(namespace?: string) {
  const { t, i18n } = useI18nextTranslation(namespace);
  
  return {
    t,
    i18n,
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage,
    isReady: i18n.isInitialized
  };
}