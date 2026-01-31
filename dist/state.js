export const appState = {
    selectedSurah: null,
    selectedAyah: null,
};
export function setSurah(surah) {
    appState.selectedSurah = surah;
    appState.selectedAyah = null;
}
export function setAyah(ayah) {
    appState.selectedAyah = ayah;
}
//# sourceMappingURL=state.js.map