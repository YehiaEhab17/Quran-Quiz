export const appState = {
    Surah: null, //unused currently
    Ayah: null, //unused currently
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
/* to listen to the state change use this function
window.addEventListener("surah:change", (e) => {
  const surah = e.detail;
  // update UI, audio, ayah list, etc
});
*/
//# sourceMappingURL=state.js.map