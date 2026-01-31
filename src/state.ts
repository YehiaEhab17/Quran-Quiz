import { Surah, Ayah, Ruku } from "./types.js";

export const appState: {
  Surah: Surah | null;
  Ayah: Ayah | null;
  Ruku: Ruku | null;
} = {
  Surah: null, //unused currently
  Ayah: null, //unused currently
  Ruku: null,
};

export function setRuku(ruku: Ruku) {
  appState.Ruku = ruku;

  window.dispatchEvent(new CustomEvent("ruku:change", { detail: ruku }));
}

/* to listen to the state change use this function
window.addEventListener("surah:change", (e) => {
  const surah = e.detail;
  // update UI, audio, ayah list, etc
});
*/
