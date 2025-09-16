// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import JSON translation files
import en from "./locales/en.json";
import sw from "./locales/sw.json";
import yo from "./locales/tw.json"; // Yoruba (new example)

// Initialize i18n
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    sw: { translation: sw },
    yo: { translation: yo },
  },
  lng: "en", // Default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;
