// ============================================================
// TONDE DESKTOP — i18next Configuration
// Langues : fr (défaut), rn (Kirundi), en
// ============================================================

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import fr from "../locales/fr.json";
import en from "../locales/en.json";

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: "fr",
  fallbackLng: "fr",
  interpolation: {
    escapeValue: false, // React échappe déjà
  },
});

export default i18n;
