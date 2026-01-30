import { populateDatalist, findSurah, getGlobalID } from "./util.js";
export class SurahAyahInputPair {
    constructor(surahInput, ayahInput, suwar, surahDatalist) {
        this.surahInput = surahInput;
        this.ayahInput = ayahInput;
        this.suwar = suwar;
        this.surahDatalist = surahDatalist;
        this.surahError = document.getElementById(`${this.surahInput.id}-error`);
        this.ayahError = document.getElementById(`${this.ayahInput.id}-error`);
        this.setupListeners();
    }
    setupListeners() {
        this.surahInput.addEventListener("focus", this.handleFocus.bind(this));
        this.surahInput.addEventListener("blur", this.handleBlur.bind(this));
        this.surahInput.addEventListener("input", this.handleSurahInput.bind(this));
        this.surahInput.addEventListener("keydown", this.preventEnter.bind(this));
        this.ayahInput.addEventListener("input", this.validateAyah.bind(this));
        this.ayahInput.addEventListener("keydown", this.allowOnlyDigits.bind(this));
    }
    handleFocus() {
        this.surahInput.select();
        populateDatalist("", this.suwar, true, this.surahDatalist);
    }
    handleBlur() {
        const surah = findSurah(this.surahInput.value, this.suwar);
        if (surah.length === 0) {
            this.surahInput.value = "";
            this.ayahInput.value = "";
            this.ayahInput.disabled = true;
            this.showError(this.surahError, "Invalid Surah");
        }
        else {
            this.surahInput.value = surah[0].display;
            this.surahInput.dataset.number = surah[0].number.toString();
            this.ayahInput.disabled = false;
            this.ayahInput.max = surah[0].length.toString();
            this.hideError(this.surahError);
            this.validateAyah();
        }
    }
    handleSurahInput() {
        const query = this.surahInput.value.trim().toLowerCase();
        populateDatalist(query, this.suwar, false, this.surahDatalist);
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
    preventEnter(e) {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    }
    allowOnlyDigits(e) {
        if (e.key === "Backspace" ||
            e.key === "Delete" ||
            e.key === "Tab" ||
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight") {
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
    getGlobalAyahID() {
        const surahID = this.getSurahID();
        const localAyahID = this.getLocalAyahID();
        if (surahID && localAyahID) {
            return getGlobalID(surahID, localAyahID, this.suwar);
        }
        return null;
    }
}
//# sourceMappingURL=types.js.map