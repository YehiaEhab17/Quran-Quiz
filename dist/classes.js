import { populateDatalist, findSurah, findAyah, concatenateAyaat, clamp, copyToClipboard, } from "./util.js";
import { appState } from "./state.js";
import { getCurrentLanguage, getText } from "./translation.js";
export class SurahAyahInputPair {
    surahInput;
    ayahInput;
    suwar;
    ayaat;
    surahDatalist;
    surahError;
    ayahError;
    constructor(surahInput, ayahInput, suwar, ayaat, surahDatalist) {
        this.surahInput = surahInput;
        this.ayahInput = ayahInput;
        this.suwar = suwar;
        this.ayaat = ayaat;
        this.surahDatalist = surahDatalist;
        this.surahError = document.getElementById(`${this.surahInput.id}-error`);
        this.ayahError = document.getElementById(`${this.ayahInput.id}-error`);
        this.setupListeners();
    }
    setupListeners() {
        this.surahInput.addEventListener("focus", this.handleFocus.bind(this));
        this.surahInput.addEventListener("blur", this.validateSurah.bind(this));
        this.surahInput.addEventListener("input", this.handleSurahInput.bind(this));
        this.ayahInput.addEventListener("input", this.validateAyah.bind(this));
        window.addEventListener("quiz:started", () => this.disableAll(true));
        window.addEventListener("quiz:stopped", () => this.disableAll(false));
    }
    handleFocus() {
        this.surahInput.select();
        populateDatalist("", this.suwar, this.surahDatalist);
    }
    handleSurahInput() {
        const query = this.surahInput.value.trim().toLowerCase();
        populateDatalist(query, this.suwar, this.surahDatalist);
    }
    validateSurah() {
        const results = findSurah(this.surahInput.value, this.suwar);
        if (results.length === 0) {
            this.surahInput.value = "";
            this.ayahInput.value = "";
            this.ayahInput.disabled = true;
            this.showError(this.surahError, getText("errors.invalidSurah"));
            return;
        }
        this.surahInput.value = results[0].display;
        this.surahInput.dataset.number = results[0].number.toString();
        this.ayahInput.disabled = false;
        this.ayahInput.max = results[0].length.toString();
        this.hideError(this.surahError);
        this.validateAyah();
    }
    validateAyah() {
        const value = this.ayahInput.value;
        this.ayahInput.value = value.replace(/[^0-9]/g, "");
        const val = parseInt(this.ayahInput.value);
        const max = parseInt(this.ayahInput.max);
        if (isNaN(val))
            return;
        this.ayahInput.value = clamp(1, val, max).toString();
        val < 1 || val > max
            ? this.showError(this.ayahError, getText("errors.invalidAyahRange") + max)
            : this.hideError(this.ayahError);
    }
    showError(errorElement, message) {
        errorElement.textContent = message;
        errorElement.classList.add("visible");
    }
    hideError(errorElement) {
        errorElement.textContent = "";
        errorElement.classList.remove("visible");
    }
    hideErrors() {
        this.hideError(this.surahError);
        this.hideError(this.ayahError);
    }
    getSurahID() {
        const value = this.surahInput.dataset.number;
        return value ? parseInt(value) : null;
    }
    getLocalAyahID() {
        const value = this.ayahInput.value;
        return value ? parseInt(value) : null;
    }
    getAyah() {
        const surahID = this.getSurahID();
        const localAyahID = this.getLocalAyahID();
        if (surahID && localAyahID) {
            return findAyah(surahID, localAyahID, this.ayaat);
        }
        return undefined;
    }
    disableAll = (state) => {
        this.surahInput.disabled = state;
        this.ayahInput.disabled = state;
    };
    verifyInputs() {
        this.validateSurah();
        this.validateAyah();
    }
}
export class QuizControls {
    display;
    report;
    suwar;
    getButton(id) {
        return document.getElementById(id);
    }
    buttons = {
        showMore: this.getButton("show-more"),
        showLess: this.getButton("show-less"),
        nextQuiz: this.getButton("next-quiz"),
        skipQuiz: this.getButton("skip-quiz"),
        copyAyah: this.getButton("copy-ayah"),
        hint: this.getButton("hint"),
        addMistake: this.getButton("add-mistake"),
        subtractMistake: this.getButton("subtract-mistake"),
    };
    hintRevealed = false;
    lastScrollTime = 0;
    mistakeCounter;
    mistakeCount = 0;
    constructor(display, report, suwar) {
        this.display = display;
        this.report = report;
        this.suwar = suwar;
        this.setupListeners();
        this.mistakeCounter = document.getElementById("mistake-count");
    }
    setupListeners() {
        this.disableAll(true);
        this.buttons.showMore.addEventListener("click", this.showMore);
        this.buttons.showLess.addEventListener("click", this.showLess);
        this.buttons.nextQuiz.addEventListener("click", () => this.nextQuiz());
        this.buttons.skipQuiz.addEventListener("click", () => this.nextQuiz(true));
        this.buttons.copyAyah.addEventListener("click", this.copyAyah);
        this.buttons.hint.addEventListener("click", this.hint);
        this.buttons.addMistake.addEventListener("click", () => this.incrementMistakes());
        this.buttons.subtractMistake.addEventListener("click", () => this.incrementMistakes(true));
        this.display.element.addEventListener("wheel", this.handleScroll.bind(this));
        window.addEventListener("quiz:started", () => {
            console.log("Quiz started.");
            this.disableAll(false);
            this.buttons.showLess.disabled = true;
        });
        window.addEventListener("quiz:stopped", () => {
            if (!appState.Ruku)
                return;
            const surah = findSurah(appState.Ruku.ayaat[0].surah.toString(), this.suwar)[0];
            this.report.addQuestion(surah, appState.Ruku, this.mistakeCount);
            this.disableAll(true);
            this.reset();
            this.report.generateReport();
        });
    }
    incrementMistakes = (decrement = false) => {
        this.mistakeCount = clamp(0, this.mistakeCount + (decrement ? -1 : 1), 999);
        this.buttons.addMistake.disabled = this.mistakeCount == 999;
        this.buttons.subtractMistake.disabled = this.mistakeCount === 0;
        this.mistakeCounter.textContent = this.mistakeCount.toString();
    };
    disableAll = (state) => {
        Object.values(this.buttons).forEach((button) => {
            button.disabled = state;
        });
    };
    handleScroll = (e) => {
        e.preventDefault();
        if (!appState.Started)
            return;
        const now = Date.now();
        if (now - this.lastScrollTime < 100)
            return;
        this.lastScrollTime = now;
        e.deltaY > 0 ? this.showMore() : this.showLess();
    };
    reset = () => {
        this.buttons.hint.textContent = getText("buttons.hint");
        this.mistakeCounter.textContent = "0";
        this.mistakeCount = 0;
    };
    showMore = () => {
        this.display.incrementIndex();
        this.updateButtons();
    };
    showLess = () => {
        this.display.incrementIndex(true);
        this.updateButtons();
    };
    nextQuiz = (skip = false) => {
        if (!appState.Ruku)
            return;
        const surah = findSurah(appState.Ruku.ayaat[0].surah.toString(), this.suwar)[0];
        if (!skip)
            this.report.addQuestion(surah, appState.Ruku, this.mistakeCount);
        this.reset();
        window.dispatchEvent(new CustomEvent("quiz:next"));
    };
    updateButtons() {
        this.buttons.showMore.disabled = this.display.index === this.display.maxAyaat;
        this.buttons.showLess.disabled = this.display.index === 0;
    }
    copyAyah = async () => {
        if (this.display.text) {
            await copyToClipboard(this.display.text);
            this.showToast(getText("buttons.copied"));
        }
    };
    showToast(message) {
        const toast = document.createElement("div");
        toast.className = "toast-notification";
        toast.textContent = message;
        document.body.appendChild(toast);
        toast.addEventListener("animationend", () => {
            toast.remove();
        });
    }
    hint = () => {
        this.hintRevealed = !this.hintRevealed;
        if (!appState.Ruku)
            return;
        if (this.hintRevealed) {
            const surah = findSurah(appState.Ruku.ayaat[0].surah.toString(), this.suwar)[0];
            const name = getCurrentLanguage() === "english" ? surah.english : surah.arabic;
            const ayahText = `${getText("dynamic.ayahPrefix")} ${appState.Ruku?.ayaat[0].ayah}`;
            this.buttons.hint.textContent = `${name}, ${ayahText}`;
        }
        else {
            this.buttons.hint.textContent = getText("buttons.hint");
        }
    };
}
export class AyahDisplay {
    display;
    ruku;
    currentAyahIndex = 0;
    text = "";
    constructor(display) {
        this.display = display;
        this.display = display;
    }
    setRuku(ruku) {
        this.ruku = ruku;
        this.currentAyahIndex = this.ruku.startIndex || 0;
        this.updateDisplay();
    }
    clear() {
        this.ruku = undefined;
        this.currentAyahIndex = 0;
        this.text = "";
        this.display.textContent = "";
    }
    incrementIndex(decrement = false) {
        if (!this.ruku)
            return;
        this.currentAyahIndex = clamp(0, this.currentAyahIndex + (decrement ? -1 : 1), this.ruku.ayaat.length - 1);
        this.updateDisplay();
        requestAnimationFrame(() => {
            this.display.scrollTop = this.display.scrollHeight;
        });
    }
    updateDisplay() {
        if (!this.ruku)
            return;
        const ayaat = this.ruku.ayaat.slice(0, this.currentAyahIndex + 1);
        this.text = concatenateAyaat(ayaat);
        this.display.textContent = this.text;
    }
    get element() {
        return this.display;
    }
    get maxAyaat() {
        return this.ruku?.ayaat?.length ? this.ruku.ayaat.length - 1 : 0;
    }
    get index() {
        return this.currentAyahIndex;
    }
}
export class BasicInput {
    input;
    error;
    constructor(input) {
        this.input = input;
        this.error = document.getElementById(`${this.input.id}-error`);
        this.input.addEventListener("input", () => {
            const value = this.input.value;
            this.input.value = value.replace(/[^0-9]/g, "");
            const val = parseInt(this.input.value);
            const max = parseInt(this.input.max);
            if (isNaN(val))
                return;
            this.input.value = clamp(1, val, max).toString();
            val < 1 || val > max
                ? this.showError(this.error, getText("errors.invalidAyahRange") + max)
                : this.hideError(this.error);
        });
    }
    showError(errorElement, message) {
        errorElement.textContent = message;
        errorElement.classList.add("visible");
    }
    hideError(errorElement) {
        errorElement.textContent = "";
        errorElement.classList.remove("visible");
    }
    get value() {
        const value = this.input.value;
        return parseInt(value);
    }
}
export class QuizReport {
    dialog;
    questions;
    constructor(dialog) {
        this.dialog = dialog;
        this.questions = [];
    }
    addQuestion(surah, ruku, mistakes) {
        const question = { surah, ruku, mistakes };
        this.questions.push(question);
    }
    generateReport() {
        console.log(this.questions);
        let report = new DocumentFragment();
        const template = document.getElementById("q-template");
        if (!template)
            return;
        let container = document.createElement("div");
        container.classList.add("report-container");
        report.appendChild(container);
        const title = document.createElement("h1");
        title.setAttribute("data-i18n", "report.title");
        title.textContent = getText("report.title");
        container.appendChild(title);
        this.questions.forEach((question, i) => {
            const clone = template.content.cloneNode(true);
            const thresholds = [
                { limit: 0, style: "perfect" },
                { limit: 0.5, style: "good" },
                { limit: 1, style: "okay" },
            ];
            const surahName = getCurrentLanguage() === "english"
                ? question.surah.english
                : question.surah.arabic;
            const startAyah = question.ruku.ayaat[0].ayah;
            const endAyah = question.ruku.ayaat.at(-1)?.ayah ?? 0;
            clone.querySelector(".q-number").textContent =
                `${getText("report.question")} ${i + 1}`;
            clone.querySelector(".q-surah-number").textContent =
                `${getText("report.surah")} ${surahName}`;
            clone.querySelector(".q-ayah-range").textContent =
                `${getText("report.fromAyah")} ${startAyah} ${getText("dynamic.to")} ${endAyah} `;
            clone.querySelector(".q-mistake-count").textContent = `${getText("report.mistakes")} ${question.mistakes}`;
            const score = question.mistakes / question.ruku.ayaat.length;
            const style = thresholds.find((t) => score <= t.limit)?.style ?? "bad";
            clone.querySelector(".q-block")?.classList.add(style);
            container.appendChild(clone);
        });
        this.dialog.innerHTML = "";
        this.dialog.appendChild(report);
        const closeBtn = document.createElement("button");
        closeBtn.id = "close-report-dialog";
        closeBtn.textContent = "X";
        closeBtn.addEventListener("click", () => this.dialog.close());
        this.dialog.appendChild(closeBtn);
        this.dialog.showModal();
        this.clear();
    }
    clear() {
        this.questions = [];
    }
}
//# sourceMappingURL=classes.js.map