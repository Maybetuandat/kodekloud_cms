import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files
import viCommon from "./locales/vi/common.json";
import viAuth from "./locales/vi/auth.json";
import viDashboard from "./locales/vi/dashboard.json";
import viQuiz from "./locales/vi/quiz.json";
import viExercise from "./locales/vi/exercise.json";
import viHome from "./locales/vi/home.json";
import viSchedule from "./locales/vi/schedule.json";
import viEditor from "./locales/vi/editor.json";
import enCommon from "./locales/en/common.json";
import enAuth from "./locales/en/auth.json";
import enDashboard from "./locales/en/dashboard.json";
import enQuiz from "./locales/en/quiz.json";
import enExercise from "./locales/en/exercise.json";
import enHome from "./locales/en/home.json";
import enSchedule from "./locales/en/schedule.json";
import enEditor from "./locales/en/editor.json";

// Configuration
i18n.use(initReactI18next).init({
  // Default language
  lng: "vi",
  fallbackLng: "en",

  // Namespaces
  ns: ["common", "auth", "dashboard", "quiz", "home", "schedule", "editor"],
  defaultNS: "common",

  // Resources
  resources: {
    vi: {
      common: viCommon,
      auth: viAuth,
      dashboard: viDashboard,
      quiz: viQuiz,
      exercise: viExercise,
      home: viHome,
      schedule: viSchedule,
      editor: viEditor,
    },
    en: {
      common: enCommon,
      auth: enAuth,
      dashboard: enDashboard,
      quiz: enQuiz,
      exercise: enExercise,
      home: enHome,
      schedule: enSchedule,
      editor: enEditor,
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
