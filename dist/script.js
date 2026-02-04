import { testGlobalIDMapping } from "./tests.js";
import { getRukuWithinRange, getRuku, addClickOutsideListener } from "./util.js";
import { SurahAyahInputPair, QuizControls, AyahDisplay, QuizReport, } from "./classes.js";
import { setRuku, quizStarted, quizStopped } from "./state.js";
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
const startQuizButton = document.getElementById("start-quiz");
const stopQuizButton = document.getElementById("stop-quiz");
const translateButton = document.getElementById("translate");
const infoButton = document.getElementById("information");
const infoDialog = document.getElementById("info-dialog");
const closeDialog = document.getElementById("close-dialog");
const reportDialog = document.getElementById("report-dialog");
// --- DATA VARIABLES ---
let suwar = [];
let ayaat = [];
let rukus = [];
let display;
let report;
let controls;
// --- INITIALIZATION ---
async function init() {
    await initTranslations();
    const [suwarResp, ayaatResp, rukusResp] = await Promise.all([
        fetch("data/suwar.json"),
        fetch("data/ayaat.json"),
        fetch("data/ruku_index.json"),
    ]);
    suwar = await suwarResp.json();
    ayaat = await ayaatResp.json();
    rukus = await rukusResp.json();
    console.log("Data loaded successfully.");
    // Run tests in development environment
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
        test();
    }
    setUpEventListeners();
    display = new AyahDisplay(quizOutput);
    report = new QuizReport(reportDialog);
    controls = new QuizControls(display, report, suwar);
    console.log(display, controls, report);
}
function setUpEventListeners() {
    const startPair = new SurahAyahInputPair(startSurahInput, startAyahInput, suwar, ayaat, surahDatalist);
    const endPair = new SurahAyahInputPair(endSurahInput, endAyahInput, suwar, ayaat, surahDatalist);
    userInput.addEventListener("submit", (event) => {
        event.preventDefault();
        start(startPair, endPair);
    });
    stopQuizButton.addEventListener("click", () => {
        quizStopped();
        display.clear();
        formError.classList.remove("visible");
        formError.textContent = "";
        stopQuizButton.classList.add("hidden");
        startQuizButton.classList.remove("hidden");
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
    addClickOutsideListener(infoDialog);
    const inputModeSelect = document.getElementById("input-mode");
    inputModeSelect.addEventListener("change", () => {
        console.log(`Input mode changed to: ${inputModeSelect.value}`);
    });
}
function start(startPair, endPair) {
    startPair.verifyInputs();
    endPair.verifyInputs();
    let startAyah = startPair.getAyah();
    let endAyah = endPair.getAyah();
    if (!startAyah || !endAyah) {
        console.error("Invalid start or end ayah.");
        return;
    }
    const rukuNumber = getRukuWithinRange(startAyah, endAyah);
    const ruku = getRuku(rukuNumber, ayaat, rukus);
    if (!ruku) {
        console.error(`No ruku found for number ${rukuNumber}.`);
        return;
    }
    quizStarted();
    startQuizButton.classList.add("hidden");
    stopQuizButton.classList.remove("hidden");
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