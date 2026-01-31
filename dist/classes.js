import { populateDatalist, findSurah, findAyah } from "./util.js";
import { appState } from "./state.js";
export class SurahAyahInputPair {
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
        this.ayahInput.addEventListener("keydown", this.allowOnlyDigits.bind(this));
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
            this.showError(this.surahError, "Enter a valid Surah");
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
        const val = parseInt(this.ayahInput.value);
        const max = parseInt(this.ayahInput.max);
        if (isNaN(val))
            return;
        if (val < 1)
            this.ayahInput.value = "1";
        if (val > max) {
            this.ayahInput.value = max.toString();
            this.showError(this.ayahError, `Max ayah is ${max}`);
        }
        else {
            this.hideError(this.ayahError);
        }
    }
    allowOnlyDigits(e) {
        if (e.key === "Backspace" ||
            e.key === "Delete" ||
            e.key === "Tab" ||
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight" ||
            e.key === "Enter") {
            return;
        }
        if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
        }
    }
    showError(errorElement, message) {
        errorElement.textContent = message;
        errorElement.classList.add("visible");
    }
    hideError(errorElement) {
        errorElement.textContent = "";
        errorElement.classList.remove("visible");
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
    verifyInputs() {
        this.validateSurah();
        this.validateAyah();
    }
}
export class QuizControls {
    getButton(id) {
        return document.getElementById(id);
    }
    constructor() {
        this.buttons = {
            showMore: this.getButton("show-more"),
            showLess: this.getButton("show-less"),
            nextQuiz: this.getButton("next-quiz"),
            copyAyah: this.getButton("copy-ayah"),
            revealSurah: this.getButton("reveal-surah"),
            revealAyah: this.getButton("reveal-ayah"),
        };
        this.surahRevealed = false;
        this.ayahRevealed = false;
        this.ayahNumber = 1;
        this.showMore = () => {
            this.ayahNumber++;
            console.log("Show More clicked");
        };
        this.showLess = () => {
            this.ayahNumber--;
            console.log("Show Less clicked");
        };
        this.nextQuiz = () => {
            console.log("Next Quiz clicked");
        };
        this.copyAyah = () => {
            console.log("Copy Ayah clicked");
        };
        this.revealSurah = () => {
            var _a;
            this.surahRevealed = !this.surahRevealed;
            if (this.surahRevealed) {
                this.buttons.revealSurah.textContent = `Surah : ${(_a = appState.Ruku) === null || _a === void 0 ? void 0 : _a.ayaat[0].surah}`;
            }
            else {
                this.buttons.revealSurah.textContent = "Reveal Surah Name";
            }
        };
        this.revealAyah = () => {
            var _a;
            this.ayahRevealed = !this.ayahRevealed;
            if (this.ayahRevealed) {
                this.buttons.revealAyah.textContent = `Ayah : ${(_a = appState.Ruku) === null || _a === void 0 ? void 0 : _a.ayaat[0].ayah}`;
            }
            else {
                this.buttons.revealAyah.textContent = "Reveal Ayah Number";
            }
        };
        this.setupListeners();
    }
    setupListeners() {
        this.buttons.showMore.addEventListener("click", this.showMore);
        this.buttons.showLess.addEventListener("click", this.showLess);
        this.buttons.nextQuiz.addEventListener("click", this.nextQuiz);
        this.buttons.copyAyah.addEventListener("click", this.copyAyah);
        this.buttons.revealSurah.addEventListener("click", this.revealSurah);
        this.buttons.revealAyah.addEventListener("click", this.revealAyah);
    }
}
//# sourceMappingURL=classes.js.map