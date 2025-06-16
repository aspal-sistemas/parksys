import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'es',
    lng: 'es', // idioma por defecto
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    defaultNS: 'common',
    ns: ['common', 'parks', 'users', 'volunteers', 'finance', 'assets'],
    
    resources: {
      es: {
        common: {}
      },
      en: {
        common: {}
      }
    }
  });

export default i18n;