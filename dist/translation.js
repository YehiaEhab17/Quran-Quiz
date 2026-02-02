let translations = null;
let currentLang = "english";
export async function initTranslations() {
    const response = await fetch("data/translation.json");
    translations = await response.json();
    updatePage();
}
export function getCurrentLanguage() {
    return currentLang;
}
export function setLanguage(lang) {
    currentLang = lang;
    updatePage();
}
function evaluateTranslationPath(keyPath) {
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
export function getText(keyPath) {
    const value = evaluateTranslationPath(keyPath);
    if (Array.isArray(value)) {
        console.warn(`Expected string but got paragraphs: ${keyPath}`);
        return value.join(" ");
    }
    return value;
}
export function getParagraphs(keyPath, separator = "\n\n") {
    const value = evaluateTranslationPath(keyPath);
    if (Array.isArray(value)) {
        return value.join(separator);
    }
    return value;
}
export function updatePage() {
    if (!translations)
        return;
    window.dispatchEvent(new CustomEvent("translated"));
    document.title = getText("pageTitle");
    // Update elements with data-i18n attribute
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (!key)
            return;
        if (el.hasAttribute("data-i18n-paragraphs")) {
            el.innerHTML = "";
            const paragraphs = getParagraphs(key).split("\n\n");
            const fragment = new DocumentFragment();
            paragraphs.forEach((p) => {
                const pEL = document.createElement("p");
                pEL.textContent = p;
                fragment.appendChild(pEL);
            });
            el.appendChild(fragment);
        }
        else {
            el.textContent = getText(key);
        }
    });
    // Handle direction (RTL for Arabic)
    document.documentElement.lang = currentLang === "arabic" ? "ar" : "en";
    document.documentElement.dir = currentLang === "arabic" ? "rtl" : "ltr";
}
//# sourceMappingURL=translation.js.map