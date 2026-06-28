import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { t as translate } from "../i18n.js";

const LANG_KEY = "language-preference";
const SUPPORTED = ["en", "fa"];
const DEFAULT_LANG = "en";

function detectBrowserLanguage() {
  const browserLang = (navigator.language || "en").toLowerCase();
  if (browserLang.startsWith("fa") || browserLang.startsWith("persian")) {
    return "fa";
  }
  return DEFAULT_LANG;
}

function getInitialLanguage() {
  let lang = localStorage.getItem(LANG_KEY);
  if (!lang) {
    lang = detectBrowserLanguage();
    localStorage.setItem(LANG_KEY, lang);
  }
  return SUPPORTED.includes(lang) ? lang : DEFAULT_LANG;
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLanguage);

  const setLang = useCallback((next) => {
    if (!SUPPORTED.includes(next)) return;
    localStorage.setItem(LANG_KEY, next);
    setLangState(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "fa" : "en");
  }, [lang, setLang]);

  // Keep the document language in sync (RTL handling is per-content, the global
  // chrome stays LTR like the original site).
  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const t = useCallback((path) => translate(lang, path), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
