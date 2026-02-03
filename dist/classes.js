import { populateDatalist, findSurah, findAyah, concatenateAyaat, clamp, copyToClipboard, } from "./util.js";
import { appState } from "./state.js";
import { getCurrentLanguage, getText } from "./translation.js";
export class SurahAyahInputPair {
    constructor(surahInput, ayahInput, suwar, ayaat, surahDatalist) {
        this.surahInput = surahInput;
        this.ayahInput = ayahInput;
        this.suwar = suwar;
        this.ayaat = ayaat;
        this.surahDatalist = surahDatalist;
        this.disableAll = (state) => {
            this.surahInput.disabled = state;
            this.ayahInput.disabled = state;
        };
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
        const results = findSurah(this.surahInput.value);
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
    verifyInputs() {
        this.validateSurah();
        this.validateAyah();
    }
}
export class QuizControls {
    getButton(id) {
        return document.getElementById(id);
    }
    constructor(display) {
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
        this.lastScrollTime = 0;
        this.disableAll = (state) => {
            Object.values(this.buttons).forEach((button) => {
                button.disabled = state;
            });
        };
        this.handleScroll = (e) => {
            e.preventDefault();
            if (!appState.Started)
                return;
            const now = Date.now();
            if (now - this.lastScrollTime < 100)
                return;
            this.lastScrollTime = now;
            e.deltaY > 0 ? this.showMore() : this.showLess();
        };
        this.reset = () => {
            this.buttons.revealSurah.textContent = getText("buttons.revealSurah");
            this.buttons.revealAyah.textContent = getText("buttons.revealAyah");
            this.buttons.copyAyah.textContent = getText("buttons.copyAyah");
        };
        this.showMore = () => {
            this.display.incrementIndex();
            this.buttons.showLess.disabled = false;
            if (this.display.index === this.display.maxAyaat - 1) {
                this.buttons.showMore.disabled = true;
            }
        };
        this.showLess = () => {
            this.display.incrementIndex(true);
            this.buttons.showMore.disabled = false;
            if (this.display.index === 0) {
                this.buttons.showLess.disabled = true;
            }
        };
        this.nextQuiz = () => {
            this.reset();
            window.dispatchEvent(new CustomEvent("quiz:next"));
        };
        this.copyAyah = async () => {
            if (this.display.text)
                await copyToClipboard(this.display.text);
            this.buttons.copyAyah.textContent = getText("buttons.copied");
        };
        this.revealSurah = () => {
            this.surahRevealed = !this.surahRevealed;
            if (!appState.Ruku)
                return;
            if (this.surahRevealed) {
                const surah = findSurah(appState.Ruku.ayaat[0].surah.toString())[0];
                let name = getCurrentLanguage() === "english" ? surah.english : surah.arabic;
                this.buttons.revealSurah.textContent = `${name}`;
            }
            else {
                this.buttons.revealSurah.textContent = getText("buttons.revealSurah");
            }
        };
        this.revealAyah = () => {
            var _a;
            this.ayahRevealed = !this.ayahRevealed;
            if (this.ayahRevealed) {
                this.buttons.revealAyah.textContent = `${getText("dynamic.ayahPrefix")} ${(_a = appState.Ruku) === null || _a === void 0 ? void 0 : _a.ayaat[0].ayah}`;
            }
            else {
                this.buttons.revealAyah.textContent = getText("buttons.revealAyah");
            }
        };
        this.display = display;
        this.setupListeners();
    }
    setupListeners() {
        this.disableAll(true);
        this.buttons.showMore.addEventListener("click", this.showMore);
        this.buttons.showLess.addEventListener("click", this.showLess);
        this.buttons.nextQuiz.addEventListener("click", this.nextQuiz);
        this.buttons.copyAyah.addEventListener("click", this.copyAyah);
        this.buttons.revealSurah.addEventListener("click", this.revealSurah);
        this.buttons.revealAyah.addEventListener("click", this.revealAyah);
        this.display.element.addEventListener("wheel", this.handleScroll.bind(this));
        window.addEventListener("quiz:started", () => {
            console.log("Quiz started.");
            this.disableAll(false);
            this.buttons.showLess.disabled = true;
        });
        window.addEventListener("quiz:stopped", () => {
            this.disableAll(true);
            this.reset();
        });
    }
}
export class AyahDisplay {
    constructor(display) {
        this.display = display;
        this.currentAyahIndex = 0;
        this.text = "";
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
        var _a, _b;
        return ((_b = (_a = this.ruku) === null || _a === void 0 ? void 0 : _a.ayaat) === null || _b === void 0 ? void 0 : _b.length) ? this.ruku.ayaat.length - 1 : 0;
    }
    get index() {
        return this.currentAyahIndex;
    }
}
export class BasicInput {
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
//# sourceMappingURL=classes.js.map