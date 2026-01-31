let translations = null;
let currentLang = "english";
export async function initTranslations() {
    const response = await fetch("data/translation.json");
    translations = await response.json();
    // Simple detection: if browser starts with 'ar', use arabic
    if (navigator.language.startsWith("ar")) {
        currentLang = "arabic";
    }
    updatePage();
}
export function getCurrentLanguage() {
    return currentLang;
}
export function setLanguage(lang) {
    currentLang = lang;
    updatePage();
}
export function getText(keyPath) {
    if (!translations)
        return "";
    const keys = keyPath.split(".");
    let current = translations;
    for (const k of keys) {
        if (current[k] === undefined) {
            console.warn(`Translation key not found: ${keyPath}`);
            return keyPath;
        }
        current = current[k];
    }
    // Current should now be a TranslationItem or similar
    const item = current;
    return item[currentLang] || item.english || "";
}
export function updatePage() {
    if (!translations)
        return;
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
//# sourceMappingURL=translation.js.map