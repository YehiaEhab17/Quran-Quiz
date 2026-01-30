export function findSurah(input, suwar, all = false) {
    const query = input.trim().toLowerCase();
    if (all) {
        return suwar;
    }
    if (!query) {
        return [];
    }
    return suwar.filter((s) => s.display.toLowerCase() === query ||
        s.number.toString().includes(query) ||
        s.english.toLowerCase().includes(query) ||
        s.arabic.includes(query));
}
export function populateDatalist(query, suwar, all = false, surahDatalist) {
    const matches = findSurah(query, suwar, all);
    surahDatalist.innerHTML = "";
    matches.forEach((s) => {
        const option = document.createElement("option");
        option.value = `${s.number}. ${s.arabic} (${s.english})`;
        surahDatalist.appendChild(option);
    });
}
export function getRukuWithinRange(start, end, ayaat) {
    const startRuku = ayaat[start - 1].ruku;
    const endRuku = ayaat[end - 1].ruku;
    const ruku = startRuku + Math.floor(Math.random() * (endRuku - startRuku + 1));
    return ruku;
}
export function getGlobalID(surahNumber, ayahNumber, suwar) {
    let ayahCount = 0;
    for (let i = 0; i < surahNumber - 1; i++) {
        ayahCount += suwar[i].length;
    }
    return ayahCount + ayahNumber;
}
export function getRukuStartingAyah(rukuNumber, ayaat) {
    const startingAyah = ayaat.find((ayah) => ayah.ruku === rukuNumber);
    return startingAyah;
}
//# sourceMappingURL=util.js.map