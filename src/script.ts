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
const formError = document.getElementById("form-error") as HTMLElement;

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
}

function start(startPair: SurahAyahInputPair, endPair: SurahAyahInputPair) {
  startPair.verifyInputs();
  endPair.verifyInputs();

  let startAyah = startPair.getAyah();
  let endAyah = endPair.getAyah();

  if (!startAyah || !endAyah) {
    console.error("Invalid start or end ayah.");
    return;
  }

  const ruku = getRukuWithinRange(startAyah, endAyah);
  const ayah = getRukuStartingAyah(ruku, ayaat);

  if (!ayah) {
    console.error(`No starting ayah found for Ruku ${ruku}.`);
    return;
  }

  if (endAyah.id < startAyah.id) {
    [startAyah, endAyah] = [endAyah, startAyah];
    console.log("Swapped start and end ayahs to maintain order.");
    formError.textContent =
      "Note: Start and End Ayahs were swapped to maintain order.";
    formError.classList.add("visible");
  }

  console.log(
    `Quiz from ${startAyah.surah}:${startAyah.ayah} to ${endAyah.surah}:${endAyah.ayah}. Starting Ruku: ${ruku}, Starting Ayah ${ayah.surah}:${ayah.ayah} (ID: ${ayah.id})`,
  );

  quizOutput.textContent = ayah.text;
}

init();

function test() {
  testGlobalIDMapping(suwar, ayaat);
}
export { suwar, ayaat };
