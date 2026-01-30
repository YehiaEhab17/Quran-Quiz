import { testGlobalIDMapping } from "./tests.js";
import { Ayah, Surah, SurahAyahInputPair } from "./types.js";
import { getRukuWithinRange, getRukuStartingAyah } from "./util.js";

// --- DOM ELEMENTS ---
const startSurahInput = document.getElementById("start-surah") as HTMLInputElement;
const startAyahInput = document.getElementById("start-ayah") as HTMLInputElement;
const endSurahInput = document.getElementById("end-surah") as HTMLInputElement;
const endAyahInput = document.getElementById("end-ayah") as HTMLInputElement;
const userInput = document.getElementById("selection-form") as HTMLFormElement;
const surahDatalist = document.getElementById("surah-names") as HTMLDataListElement;

const quizOutput = document.getElementById("quiz-output") as HTMLElement;

// --- DATA VARIABLES ---
let suwar: Surah[] = [];
let ayaat: Ayah[] = [];

// --- INITIALIZATION ---
async function init() {
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
}

function setUpEventListeners() {
  const startPair = new SurahAyahInputPair(
    startSurahInput,
    startAyahInput,
    suwar,
    surahDatalist,
  );

  const endPair = new SurahAyahInputPair(
    endSurahInput,
    endAyahInput,
    suwar,
    surahDatalist,
  );

  userInput.addEventListener("submit", (event) => {
    event.preventDefault();
    start(startPair, endPair);
  });
}

function start(startPair: SurahAyahInputPair, endPair: SurahAyahInputPair) {
  const startAyah = startPair.getGlobalAyahID();
  const endAyah = endPair.getGlobalAyahID();

  if (!startAyah || !endAyah) {
    console.error("Invalid start or end ayah.");
    return;
  }

  const ruku = getRukuWithinRange(startAyah, endAyah, ayaat);
  const ayah = getRukuStartingAyah(ruku, ayaat);

  if (!ayah) {
    console.error(`No starting ayah found for Ruku ${ruku}.`);
    return;
  }

  console.log(
    `Quiz will in range ayah ${startAyah} to ayah ${endAyah}, within Ruku ${ruku} at ayah ${ayah.id} in surah ${ayah.surah} ${ayah.ayah}.`,
  );

  quizOutput.textContent = ayah.text;
}

init();

function test() {
  testGlobalIDMapping(suwar, ayaat);
}
export { suwar, ayaat };
