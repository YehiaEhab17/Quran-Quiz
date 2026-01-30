var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { testGlobalIDMapping } from "./tests.js";
import { SurahAyahInputPair } from "./types.js";
import { getRukuWithinRange, getRukuStartingAyah } from "./util.js";
// --- DOM ELEMENTS ---
const startSurahInput = document.getElementById("start-surah");
const startAyahInput = document.getElementById("start-ayah");
const endSurahInput = document.getElementById("end-surah");
const endAyahInput = document.getElementById("end-ayah");
const userInput = document.getElementById("selection-form");
const surahDatalist = document.getElementById("surah-names");
const quizOutput = document.getElementById("quiz-output");
// --- DATA VARIABLES ---
let suwar = [];
let ayaat = [];
// --- INITIALIZATION ---
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const [suwarResp, ayaatResp] = yield Promise.all([
            fetch("data/suwar.json"),
            fetch("data/ayaat.json"),
        ]);
        suwar = yield suwarResp.json();
        ayaat = yield ayaatResp.json();
        console.log("Data loaded successfully.");
        // Run tests in development environment
        if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
            test();
        }
        setUpEventListeners();
    });
}
function setUpEventListeners() {
    const startPair = new SurahAyahInputPair(startSurahInput, startAyahInput, suwar, surahDatalist);
    const endPair = new SurahAyahInputPair(endSurahInput, endAyahInput, suwar, surahDatalist);
    userInput.addEventListener("submit", (event) => {
        event.preventDefault();
        start(startPair, endPair);
    });
}
function start(startPair, endPair) {
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
    console.log(`Quiz will in range ayah ${startAyah} to ayah ${endAyah}, within Ruku ${ruku} at ayah ${ayah.id} in surah ${ayah.surah} ${ayah.ayah}.`);
    quizOutput.textContent = ayah.text;
}
init();
function test() {
    testGlobalIDMapping(suwar, ayaat);
}
export { suwar, ayaat };
//# sourceMappingURL=script.js.map