import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import te from './locales/te.json';
import hi from './locales/hi.json';

const savedLanguage = localStorage.getItem('agri_exchange_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      te: { translation: te },
      hi: { translation: hi }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export const AVAILABLE_LANGUAGES = [
  { code: 'en', label: 'English 🇬🇧', flag: '🇬🇧', name: 'English' },
  { code: 'te', label: 'తెలుగు (Telugu) 🇮🇳', flag: '🇮🇳', name: 'తెలుగు' },
  { code: 'hi', label: 'हिन्दी (Hindi) 🇮🇳', flag: '🇮🇳', name: 'हिन्दी' }
];

export default i18n;
