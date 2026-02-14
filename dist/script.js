import { testGlobalIDMapping } from "./tests.js";
import { getRukuWithinRange, getRuku, addClickOutsideListener } from "./util.js";
import { QuizInputPair, QuizControls, AyahDisplay, QuizReport, } from "./classes.js";
import { setRuku, quizStarted, quizStopped } from "./state.js";
import { initTranslations, getText, getCurrentLanguage, setLanguage, updatePage, } from "./translation.js";
// --- DOM ELEMENTS ---
const inputMode = document.getElementById("input-mode");
const ayahInputs = document.getElementById("ayah-inputs");
const labelOne = document.getElementById("start-label");
const labelTwo = document.getElementById("end-label");
const startInput = document.getElementById("start-input");
const startAyahInput = document.getElementById("start-ayah");
const endInput = document.getElementById("end-input");
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
let startPair;
let endPair;
let inputType = inputMode.value;
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
    // Initialize Classes
    display = new AyahDisplay(quizOutput);
    report = new QuizReport(reportDialog);
    controls = new QuizControls(display, report, suwar);
    startPair = new QuizInputPair(startInput, startAyahInput, suwar, ayaat, surahDatalist, "start");
    endPair = new QuizInputPair(endInput, endAyahInput, suwar, ayaat, surahDatalist, "end");
    setupFormListeners();
    setupControlListeners();
    setupGlobalListeners();
    setupDialogListeners();
    console.log(display, controls, report);
}
function setupFormListeners() {
    userInput.addEventListener("submit", (event) => {
        event.preventDefault();
        start();
    });
    inputMode.addEventListener("change", () => {
        inputType = inputMode.value;
        updateInputs();
    });
    updateInputs();
}
function setupControlListeners() {
    stopQuizButton.addEventListener("click", () => {
        quizStopped();
        display.clear();
        formError.classList.remove("visible");
        formError.textContent = "";
        stopQuizButton.classList.add("hidden");
        startQuizButton.classList.remove("hidden");
        inputMode.disabled = false;
    });
    translateButton.addEventListener("click", () => {
        getCurrentLanguage() === "english"
            ? setLanguage("arabic")
            : setLanguage("english");
    });
}
function setupGlobalListeners() {
    window.addEventListener("ruku:change", (e) => {
        const customEvent = e;
        const ruku = customEvent.detail;
        console.log(`State changed: Ruku ${ruku.id} loaded.`);
        display.setRuku(ruku);
    });
    window.addEventListener("quiz:next", () => {
        start();
    });
    window.addEventListener("translated", () => {
        startPair.hideErrors();
        endPair.hideErrors();
        formError.classList.remove("visible");
        formError.textContent = "";
    });
}
function setupDialogListeners() {
    infoButton.addEventListener("click", () => {
        infoDialog.showModal();
    });
    closeDialog.addEventListener("click", () => {
        infoDialog.close();
    });
    addClickOutsideListener(infoDialog);
}
function updateInputs() {
    ayahInputs.classList.toggle("hide", inputType !== "ayah");
    const mode = inputType;
    startPair.setMode(mode);
    endPair.setMode(mode);
    switch (inputType) {
        case "ayah":
        case "surah":
            labelOne.dataset.i18n = "labels.startSurah";
            labelTwo.dataset.i18n = "labels.endSurah";
            break;
        case "juz":
            labelOne.dataset.i18n = "labels.startJuz";
            labelTwo.dataset.i18n = "labels.endJuz";
            break;
        case "hizb":
            labelOne.dataset.i18n = "labels.startHizb";
            labelTwo.dataset.i18n = "labels.endHizb";
            break;
    }
    updatePage();
}
function start() {
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
    inputMode.disabled = true;
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