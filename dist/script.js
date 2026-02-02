import { testGlobalIDMapping } from "./tests.js";
import { getRukuWithinRange, getRuku } from "./util.js";
import { SurahAyahInputPair, QuizControls, AyahDisplay } from "./classes.js";
import { setRuku, quizStarted } from "./state.js";
import { initTranslations, getText, getCurrentLanguage, setLanguage, } from "./translation.js";
// --- DOM ELEMENTS ---
const startSurahInput = document.getElementById("start-surah");
const startAyahInput = document.getElementById("start-ayah");
const endSurahInput = document.getElementById("end-surah");
const endAyahInput = document.getElementById("end-ayah");
const userInput = document.getElementById("selection-form");
const surahDatalist = document.getElementById("surah-names");
const quizOutput = document.getElementById("quiz-output");
const formError = document.getElementById("form-error");
const translateButton = document.getElementById("translate");
const infoButton = document.getElementById("information");
const infoDialog = document.getElementById("info-dialog");
const closeDialog = document.getElementById("close-dialog");
// --- DATA VARIABLES ---
let suwar = [];
let ayaat = [];
let display;
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
    const startPair = new SurahAyahInputPair(startSurahInput, startAyahInput, suwar, ayaat, surahDatalist);
    const endPair = new SurahAyahInputPair(endSurahInput, endAyahInput, suwar, ayaat, surahDatalist);
    userInput.addEventListener("submit", (event) => {
        event.preventDefault();
        start(startPair, endPair);
    });
    translateButton.addEventListener("click", () => {
        getCurrentLanguage() === "english"
            ? setLanguage("arabic")
            : setLanguage("english");
    });
    window.addEventListener("ruku:change", (e) => {
        const customEvent = e;
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
    const inputModeSelect = document.getElementById("input-mode");
    inputModeSelect.addEventListener("change", () => {
        console.log(`Input mode changed to: ${inputModeSelect.value}`);
    });
}
function start(startPair, endPair) {
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
    }
    else {
        formError.classList.remove("visible");
        formError.textContent = "";
    }
    console.log(`Quiz from ${startAyah.surah}:${startAyah.ayah} to ${endAyah.surah}:${endAyah.ayah}. 
    Starting Ruku: ${ruku.id}, Starting Ayah ${ayah.surah}:${ayah.ayah} (ID: ${ayah.id})`);
    setRuku(ruku);
}
window.addEventListener("load", init);
function test() {
    testGlobalIDMapping(suwar, ayaat);
}
export { suwar, ayaat };
//# sourceMappingURL=script.js.map