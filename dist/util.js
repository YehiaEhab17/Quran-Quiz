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
export function getRukuStartingAyah(rukuNumber, ayaat) {
    const startingAyah = ayaat.find((ayah) => ayah.ruku === rukuNumber);
    return startingAyah;
}
//# sourceMappingURL=util.js.map