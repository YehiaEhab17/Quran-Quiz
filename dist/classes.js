import { populateDatalist, findSurah, findAyah, concatenateAyaat, clamp, copyToClipboard, getBounds, } from "./util.js";
import { appState } from "./state.js";
import { getCurrentLanguage, getText } from "./translation.js";
export class QuizInputPair {
    primaryInput;
    ayahInput;
    suwar;
    ayaat;
    datalist;
    type;
    primaryError;
    ayahError;
    mode = "ayah";
    constructor(primaryInput, ayahInput, suwar, ayaat, datalist, type) {
        this.primaryInput = primaryInput;
        this.ayahInput = ayahInput;
        this.suwar = suwar;
        this.ayaat = ayaat;
        this.datalist = datalist;
        this.type = type;
        this.primaryError = document.getElementById(`${this.primaryInput.id}-error`);
        this.ayahError = document.getElementById(`${this.ayahInput.id}-error`);
        this.setupListeners();
    }
    setupListeners() {
        this.primaryInput.addEventListener("focus", this.handleFocus.bind(this));
        this.primaryInput.addEventListener("blur", this.validateFirstInput.bind(this));
        this.primaryInput.addEventListener("input", this.handlePrimaryInput.bind(this));
        this.ayahInput.addEventListener("input", this.validateAyah.bind(this));
        window.addEventListener("quiz:started", () => this.disableAll(true));
        window.addEventListener("quiz:stopped", () => this.disableAll(false));
    }
    setMode(mode) {
        this.mode = mode;
        this.primaryInput.value = "";
        this.ayahInput.value = "";
        this.hideErrors();
        if (this.mode === "juz" || this.mode === "hizb") {
            this.primaryInput.type = "number";
            this.primaryInput.removeAttribute("list");
            this.primaryInput.min = "1";
            this.primaryInput.max = this.mode === "juz" ? "30" : "240";
        }
        else {
            this.primaryInput.type = "text";
            this.primaryInput.setAttribute("list", "surah-names");
        }
        if (this.mode === "ayah") {
            this.ayahInput.setAttribute("required", "");
        }
        else {
            this.ayahInput.removeAttribute("required");
        }
    }
    handleFocus() {
        if (this.mode === "ayah" || this.mode === "surah") {
            this.primaryInput.select();
            populateDatalist("", this.suwar, this.datalist);
        }
    }
    handlePrimaryInput() {
        if (this.mode === "ayah" || this.mode === "surah") {
            const query = this.primaryInput.value.trim().toLowerCase();
            populateDatalist(query, this.suwar, this.datalist);
        }
        else {
            this.validateNumber();
        }
    }
    validateFirstInput() {
        if (this.mode === "ayah" || this.mode === "surah") {
            this.validateSurah();
        }
        else {
            this.validateNumber();
        }
    }
    validateNumber() {
        const val = parseInt(this.primaryInput.value);
        const max = this.mode === "juz" ? 30 : 240;
        if (isNaN(val)) {
            const msgKey = this.mode === "juz" ? "errors.invalidJuz" : "errors.invalidHizb";
            this.showError(this.primaryError, getText(msgKey));
            return;
        }
        this.primaryInput.value = clamp(1, val, max).toString();
        this.hideError(this.primaryError);
    }
    validateSurah() {
        const results = findSurah(this.primaryInput.value, this.suwar);
        if (results.length === 0) {
            this.primaryInput.value = "";
            this.ayahInput.value = "";
            this.ayahInput.disabled = true;
            this.showError(this.primaryError, getText("errors.invalidSurah"));
            return;
        }
        this.primaryInput.value = results[0].display;
        this.primaryInput.dataset.number = results[0].number.toString();
        this.ayahInput.disabled = false;
        this.ayahInput.max = results[0].length.toString();
        this.hideError(this.primaryError);
        if (this.mode === "ayah") {
            this.validateAyah();
        }
    }
    validateAyah() {
        if (this.mode !== "ayah")
            return;
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
        this.hideError(this.primaryError);
        this.hideError(this.ayahError);
    }
    getSurahID() {
        const value = this.primaryInput.dataset.number;
        return value ? parseInt(value) : null;
    }
    getLocalAyahID() {
        const value = this.ayahInput.value;
        return value ? parseInt(value) : null;
    }
    getAyah() {
        if (this.mode === "ayah") {
            const surahID = this.primaryInput.dataset.number
                ? parseInt(this.primaryInput.dataset.number)
                : null;
            const localAyahID = this.ayahInput.value ? parseInt(this.ayahInput.value) : null;
            if (surahID && localAyahID) {
                return findAyah(surahID, localAyahID, this.ayaat);
            }
            return undefined;
        }
        let val;
        if (this.mode === "surah") {
            val = this.primaryInput.dataset.number
                ? parseInt(this.primaryInput.dataset.number)
                : NaN;
        }
        else {
            val = parseInt(this.primaryInput.value);
        }
        if (isNaN(val))
            return undefined;
        const bounds = getBounds(this.mode, val, this.ayaat);
        return bounds ? bounds[this.type] : undefined;
    }
    disableAll = (state) => {
        this.primaryInput.disabled = state;
        this.ayahInput.disabled = state;
    };
    verifyInputs() {
        this.validateFirstInput();
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
        // Create a wrapper for content to manage padding and positioning relative to the sticky button
        let wrapper = document.createElement("div");
        wrapper.classList.add("report-content-wrapper");
        report.appendChild(wrapper);
        // Create Close Button (Sticky)
        const closeBtn = document.createElement("button");
        closeBtn.id = "close-report-dialog";
        closeBtn.textContent = "X";
        closeBtn.addEventListener("click", () => this.dialog.close());
        wrapper.appendChild(closeBtn);
        // Create Download Button (Sticky)
        const downloadBtn = document.createElement("button");
        downloadBtn.id = "download-report-btn";
        downloadBtn.title = "Download Report";
        downloadBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download-icon lucide-download"><path d="M12 15V3" data--h-bstatus="0OBSERVED"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" data--h-bstatus="0OBSERVED"/><path d="m7 10 5 5 5-5" data--h-bstatus="0OBSERVED"/></svg>`;
        downloadBtn.addEventListener("click", () => this.downloadReport());
        wrapper.appendChild(downloadBtn);
        let container = document.createElement("div");
        container.classList.add("report-container");
        container.id = "quiz-report"; // ID for html2canvas
        wrapper.appendChild(container);
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
        this.dialog.showModal();
        this.clear();
    }
    async downloadReport() {
        const reportElement = document.getElementById("quiz-report");
        if (!reportElement)
            return;
        try {
            // @ts-ignore
            const canvas = await window.html2canvas(reportElement, {
                scale: 2,
                backgroundColor: getComputedStyle(document.body).getPropertyValue("--dialog-bg") || "#ffffff",
            });
            const link = document.createElement("a");
            link.download = `quran-quiz-report-${new Date().toISOString().split("T")[0]}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        }
        catch (error) {
            console.error("Failed to generate report image:", error);
        }
    }
    clear() {
        this.questions = [];
    }
}
//# sourceMappingURL=classes.js.map