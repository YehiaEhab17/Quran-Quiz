export function findSurah(input, suwar) {
    const query = input.trim().toLowerCase();
    if (!query) {
        return [];
    }
    return suwar.filter((s) => s.display.toLowerCase() === query ||
        s.number.toString().includes(query) ||
        s.english.toLowerCase().includes(query) ||
        s.arabic.includes(query));
}
export function findAyah(surahNumber, ayahNumber, ayaat) {
    return ayaat.find((a) => a.surah === surahNumber && a.ayah === ayahNumber);
}
export function populateDatalist(query, suwar, surahDatalist) {
    const matches = query.trim() ? findSurah(query, suwar) : suwar;
    surahDatalist.innerHTML = "";
    const fragment = document.createDocumentFragment();
    matches.forEach((s) => {
        const option = document.createElement("option");
        option.value = `${s.number}. ${s.arabic} (${s.english})`;
        fragment.appendChild(option);
    });
    surahDatalist.appendChild(fragment);
}
export function getRukuWithinRange(start, end) {
    const startRuku = start.ruku;
    const endRuku = end.ruku;
    const ruku = startRuku + Math.floor(Math.random() * (endRuku - startRuku + 1));
    return ruku;
}
export function getRuku(rukuNumber, ayaat, rukus) {
    const ayaatInRuku = ayaat.filter((ayah) => ayah.ruku === rukuNumber);
    const startIndex = rukus[rukuNumber - 1]?.startIndex;
    return ayaatInRuku.length > 0
        ? { id: rukuNumber, startIndex: startIndex, ayaat: ayaatInRuku }
        : undefined;
}
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const DIGIT_REGEX = /\d/g;
export function getArabicDigit(num) {
    return num.toString().replace(DIGIT_REGEX, (d) => ARABIC_DIGITS[+d]);
}
export function concatenateAyaat(ayaat) {
    if (ayaat.length === 0)
        return "";
    let combinedText = ayaat[0].text;
    for (let i = 1; i < ayaat.length; i++) {
        combinedText += ` ${getArabicDigit(ayaat[i - 1].ayah)} ${ayaat[i].text}`;
    }
    return combinedText;
}
export function clamp(min, value, max) {
    return Math.min(Math.max(value, min), max);
}
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        console.log("Copied to clipboard!");
    }
    catch (err) {
        console.error("Failed to copy: ", err);
    }
}
//# sourceMappingURL=util.js.map