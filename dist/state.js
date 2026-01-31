export const appState = {
    Surah: null, //unused
    Ayah: null, //unused
    Ruku: null,
    Started: false,
};
export function setRuku(ruku) {
    appState.Ruku = ruku;
    window.dispatchEvent(new CustomEvent("ruku:change", { detail: ruku }));
}
export function quizStarted() {
    appState.Started = true;
    window.dispatchEvent(new CustomEvent("quiz:started"));
}
export function quizStopped() {
    appState.Started = false;
    window.dispatchEvent(new CustomEvent("quiz:stopped"));
}
//# sourceMappingURL=state.js.map