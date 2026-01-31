import { populateDatalist, findSurah, findAyah } from "./util.js";
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
//# sourceMappingURL=types.js.map