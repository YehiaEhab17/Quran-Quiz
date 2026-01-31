import { TranslationData, TranslationItem } from "./types.js";

type Language = "english" | "arabic";
let translations: TranslationData | null = null;
let currentLang: Language = "english";

export async function initTranslations(): Promise<void> {
  const response = await fetch("data/translation.json");
  translations = await response.json();

  // Simple detection: if browser starts with 'ar', use arabic
  if (navigator.language.startsWith("ar")) {
    currentLang = "arabic";
  }

  updatePage();
}

export function getCurrentLanguage(): Language {
  return currentLang;
}

export function setLanguage(lang: Language) {
  currentLang = lang;
  updatePage();
}

export function getText(keyPath: string): string {
  if (!translations) return "";
  const keys = keyPath.split(".");
  let current: any = translations;
  for (const k of keys) {
    if (current[k] === undefined) {
      console.warn(`Translation key not found: ${keyPath}`);
      return keyPath;
    }
    current = current[k];
  }
  // Current should now be a TranslationItem or similar
  const item = current as TranslationItem;
  return item[currentLang] || item.english || "";
}

export function updatePage() {
  if (!translations) return;
  document.title = translations.pageTitle[currentLang];

  // Update elements with data-i18n attribute
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) {
      el.textContent = getText(key);
    }
  });
  // Handle direction (RTL for Arabic)
  document.documentElement.lang = currentLang === "arabic" ? "ar" : "en";
  document.documentElement.dir = currentLang === "arabic" ? "rtl" : "ltr";
}
