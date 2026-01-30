import { testGlobalIDMapping } from "./tests.js";
import { Ayah, Surah } from "./interface.js";
import {
  findSurah,
  populateDatalist,
  getRukuWithinRange,
  getGlobalID,
  getRukuStartingAyah,
} from "./util.js";

// --- DOM ELEMENTS ---
const startSurahInput = document.getElementById("start-surah") as HTMLInputElement;
const startAyahInput = document.getElementById("start-ayah") as HTMLInputElement;
const endSurahInput = document.getElementById("end-surah") as HTMLInputElement;
const endAyahInput = document.getElementById("end-ayah") as HTMLInputElement;
const userInput = document.getElementById("selection-form") as HTMLFormElement;
const surahDatalist = document.getElementById("surah-names") as HTMLDataListElement;

const dependencyMap = new Map<HTMLInputElement, HTMLInputElement>([
  [startSurahInput, startAyahInput],
  [endSurahInput, endAyahInput],
]);

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
  dependencyMap.forEach((dependant, input) => {
    input.addEventListener("focus", () => {
      input.select();
      populateDatalist("", suwar, true, surahDatalist);
    });

    input.addEventListener("blur", () => {
      const surah = findSurah(input.value, suwar);
      if (surah.length === 0) {
        input.value = "";
        dependant.disabled = true;
      } else {
        input.value = surah[0].display;
        input.dataset.number = surah[0].number.toString();
        dependant.disabled = false;
        dependant.max = surah[0].length.toString();

        if (parseInt(dependant.value) > surah[0].length) {
          dependant.value = surah[0].length.toString();
        }
        console.log(dependant.max);
        console.log(input.name, surah);
      }
    });

    input.addEventListener("input", () => {
      const query = input.value.trim().toLowerCase();
      populateDatalist(query, suwar, false, surahDatalist);
    });

    dependant.addEventListener("input", () => {
      const val = parseInt(dependant.value);
      const max = parseInt(dependant.max);

      if (isNaN(val)) return;

      if (val > max) dependant.value = max.toString();
      if (val < 1) dependant.value = "1";
    });

    dependant.addEventListener("keydown", (e) => {
      // Only allow digits 0-9
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
      }
    });
  });

  userInput.addEventListener("submit", function (event) {
    event.preventDefault();
    start();
  });
}

function start() {
  const startAyah = getGlobalID(
    parseInt(startSurahInput.dataset.number!),
    parseInt(startAyahInput.value),
    suwar,
  );
  const endAyah = getGlobalID(
    parseInt(endSurahInput.dataset.number!),
    parseInt(endAyahInput.value),
    suwar,
  );
  const ruku = getRukuWithinRange(startAyah, endAyah, ayaat);

  const ayah = getRukuStartingAyah(ruku, ayaat);

  if (!ayah) {
    console.error(`No starting ayah found for Ruku ${ruku}.`);
    return;
  }
  console.log(
    `Quiz will in range ayah ${startAyah} to ayah ${endAyah}, within Ruku ${ruku} at ayah ${ayah.id}.`,
  );
}

init();

function test() {
  testGlobalIDMapping(suwar, ayaat);
}
export { suwar, ayaat };
