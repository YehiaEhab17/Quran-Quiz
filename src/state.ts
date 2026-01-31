import { Surah, Ayah, Ruku } from "./types.js";

export const appState: {
  Surah: Surah | null;
  Ayah: Ayah | null;
  Ruku: Ruku | null;
  Started: boolean;
} = {
  Surah: null, //unused
  Ayah: null, //unused
  Ruku: null,
  Started: false,
};

export function setRuku(ruku: Ruku) {
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
