import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './translations/en.json';
import de from './translations/de.json';
import fr from './translations/fr.json';
import it from './translations/it.json';
import es from './translations/es.json';
import nl from './translations/nl.json';

const getSupportedLanguage = (detectedLanguage) => {
  const supportedLanguages = {
    'en-US': 'en',
    'en-GB': 'en',
    'de-DE': 'de',
    'fr-FR': 'fr',
    'it-IT': 'it',
    'es-ES': 'es',
    'nl-NL': 'nl',
    'nl-BE': 'nl',
  };
  
  return supportedLanguages[detectedLanguage] || 'en';
};

const savedLanguage = localStorage.getItem('language') || getSupportedLanguage(navigator.language);

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
      fr: { translation: fr },
      it: { translation: it },
      es: { translation: es },
      nl: { translation: nl },
    },
    fallbackLng: 'en',
    lng: savedLanguage,
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      checkWhitelist: true,
    },
    whitelist: ['en', 'de', 'fr', 'it', 'es', 'nl'],
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
