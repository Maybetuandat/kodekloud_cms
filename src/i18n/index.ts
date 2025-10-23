import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files
import viCommon from "./locales/vi/common.json";

import enCommon from "./locales/en/common.json";
import viCourses from "./locales/vi/courses.json";
import enCourses from "./locales/en/courses.json";
import viCategories from "./locales/vi/categories.json";
import enCategories from "./locales/en/categories.json";
import viLabs from "./locales/vi/labs.json";
import enLabs from "./locales/en/labs.json";

// Configuration
i18n.use(initReactI18next).init({
  // Default language
  lng: "vi",
  fallbackLng: "en",

  // Namespaces
  ns: ["common", "courses", "categories", "labs"],
  defaultNS: "common",

  // Resources
  resources: {
    vi: {
      common: viCommon,
      courses: viCourses,
      categories: viCategories,
      labs: viLabs,
    },
    en: {
      common: enCommon,
      courses: enCourses,
      categories: enCategories,
      labs: enLabs,
    },
  },

  // Development settings
  debug: process.env.NODE_ENV === "development",

  interpolation: {
    escapeValue: false, // React already does escaping
  },

  // Load language from localStorage if available
  react: {
    useSuspense: false,
  },
});

// Save language preference to localStorage
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("i18nextLng", lng);
});

// Load saved language preference
const savedLanguage = localStorage.getItem("i18nextLng");
if (savedLanguage && ["vi", "en"].includes(savedLanguage)) {
  i18n.changeLanguage(savedLanguage);
}

export default i18n;
