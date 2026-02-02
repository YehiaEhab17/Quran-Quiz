import { testGlobalIDMapping } from "./tests.js";
import { Ayah, Surah } from "./types.js";
import { getRukuWithinRange, getRuku } from "./util.js";
import { SurahAyahInputPair, QuizControls, AyahDisplay } from "./classes.js";
import { setRuku, quizStarted } from "./state.js";
import {
  initTranslations,
  getText,
  getCurrentLanguage,
  setLanguage,
} from "./translation.js";

// --- DOM ELEMENTS ---
const startSurahInput = document.getElementById("start-surah") as HTMLInputElement;
const startAyahInput = document.getElementById("start-ayah") as HTMLInputElement;
const endSurahInput = document.getElementById("end-surah") as HTMLInputElement;
const endAyahInput = document.getElementById("end-ayah") as HTMLInputElement;

const userInput = document.getElementById("selection-form") as HTMLFormElement;
const surahDatalist = document.getElementById("surah-names") as HTMLDataListElement;

const quizOutput = document.getElementById("quiz-output") as HTMLElement;
const formError = document.getElementById("form-error") as HTMLElement;

const translateButton = document.getElementById("translate") as HTMLButtonElement;
const infoButton = document.getElementById("information") as HTMLButtonElement;
const infoDialog = document.getElementById("info-dialog") as HTMLDialogElement;
const closeDialog = document.getElementById("close-dialog") as HTMLButtonElement;

// --- DATA VARIABLES ---
let suwar: Surah[] = [];
let ayaat: Ayah[] = [];
let display: AyahDisplay;

// --- INITIALIZATION ---
async function init() {
  await initTranslations();

  const [suwarResp, ayaatResp] = await Promise.all([
    fetch("data/suwar.json"),
    fetch("data/ayaat.json"),
  ]);

  suwar = await suwarResp.json();
  ayaat = await ayaatResp.json();

  console.log("Data loaded successfully.");

  // Run tests in development environment
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    test();
  }

  setUpEventListeners();
  display = new AyahDisplay(quizOutput);
  new QuizControls(display);
}

function setUpEventListeners() {
  const startPair = new SurahAyahInputPair(
    startSurahInput,
    startAyahInput,
    suwar,
    ayaat,
    surahDatalist,
  );

  const endPair = new SurahAyahInputPair(
    endSurahInput,
    endAyahInput,
    suwar,
    ayaat,
    surahDatalist,
  );

  userInput.addEventListener("submit", (event) => {
    event.preventDefault();
    start(startPair, endPair);
  });

  translateButton.addEventListener("click", () => {
    getCurrentLanguage() === "english"
      ? setLanguage("arabic")
      : setLanguage("english");
  });

  window.addEventListener("ruku:change", (e: Event) => {
    const customEvent = e as CustomEvent;
    const ruku = customEvent.detail;

    console.log(`State changed: Ruku ${ruku.id} loaded.`);

    display.setRuku(ruku);
  });

  window.addEventListener("quiz:next", () => {
    start(startPair, endPair);
  });

  window.addEventListener("translated", () => {
    startPair.hideErrors();
    endPair.hideErrors();
    formError.classList.remove("visible");
    formError.textContent = "";
  });

  infoButton.addEventListener("click", () => {
    infoDialog.showModal();
  });

  closeDialog.addEventListener("click", () => {
    infoDialog.close();
  });

  infoDialog.addEventListener("click", (e) => {
    if (e.target === infoDialog) {
      infoDialog.close();
    }
  });

  const inputModeSelect = document.getElementById("input-mode") as HTMLSelectElement;
  inputModeSelect.addEventListener("change", () => {
    console.log(`Input mode changed to: ${inputModeSelect.value}`);
  });
}

function start(startPair: SurahAyahInputPair, endPair: SurahAyahInputPair) {
  quizStarted();
  startPair.verifyInputs();
  endPair.verifyInputs();

  let startAyah = startPair.getAyah();
  let endAyah = endPair.getAyah();

  if (!startAyah || !endAyah) {
    console.error("Invalid start or end ayah.");
    return;
  }

  const rukuNumber = getRukuWithinRange(startAyah, endAyah);
  const ruku = getRuku(rukuNumber, ayaat);
  if (!ruku) {
    console.error(`No ruku found for number ${rukuNumber}.`);
    return;
  }
  const ayah = ruku.ayaat[0];

  if (endAyah.id < startAyah.id) {
    [startAyah, endAyah] = [endAyah, startAyah];
    console.log("Swapped start and end ayahs to maintain order.");
    formError.textContent = getText("errors.swappedAyahs");
    formError.classList.add("visible");
  } else {
    formError.classList.remove("visible");
    formError.textContent = "";
  }

  console.log(
    `Quiz from ${startAyah.surah}:${startAyah.ayah} to ${endAyah.surah}:${endAyah.ayah}. 
    Starting Ruku: ${ruku.id}, Starting Ayah ${ayah.surah}:${ayah.ayah} (ID: ${ayah.id})`,
  );

  setRuku(ruku);
}

init();

function test() {
  testGlobalIDMapping(suwar, ayaat);
}
export { suwar, ayaat };
