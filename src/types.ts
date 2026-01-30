import { populateDatalist, findSurah, getGlobalID } from "./util.js";

export interface Surah {
  display: string;
  arabic: string;
  english: string;
  number: number;
  length: number;
}

export interface Ayah {
  id: number;
  surah: number;
  ayah: number;
  text: string;
  ruku: number;
  hizb: number;
  juz: number;
}

export class SurahAyahInputPair {
  private surahError: HTMLElement;
  private ayahError: HTMLElement;

  constructor(
    private surahInput: HTMLInputElement,
    private ayahInput: HTMLInputElement,
    private suwar: Surah[],
    private surahDatalist: HTMLDataListElement,
  ) {
    this.surahError = document.getElementById(`${this.surahInput.id}-error`)!;
    this.ayahError = document.getElementById(`${this.ayahInput.id}-error`)!;
    this.setupListeners();
  }

  private setupListeners() {
    this.surahInput.addEventListener("focus", this.handleFocus.bind(this));
    this.surahInput.addEventListener("blur", this.handleBlur.bind(this));
    this.surahInput.addEventListener("input", this.handleSurahInput.bind(this));
    this.surahInput.addEventListener("keydown", this.preventEnter.bind(this));

    this.ayahInput.addEventListener("input", this.validateAyah.bind(this));
    this.ayahInput.addEventListener("keydown", this.allowOnlyDigits.bind(this));
  }

  private handleFocus() {
    this.surahInput.select();
    populateDatalist("", this.suwar, true, this.surahDatalist);
  }

  private handleBlur() {
    const surah = findSurah(this.surahInput.value, this.suwar);

    if (surah.length === 0) {
      this.surahInput.value = "";
      this.ayahInput.value = "";
      this.ayahInput.disabled = true;
      this.showError(this.surahError, "Invalid Surah");
    } else {
      this.surahInput.value = surah[0].display;
      this.surahInput.dataset.number = surah[0].number.toString();
      this.ayahInput.disabled = false;
      this.ayahInput.max = surah[0].length.toString();

      this.hideError(this.surahError);
      this.validateAyah();
    }
  }

  private handleSurahInput() {
    const query = this.surahInput.value.trim().toLowerCase();
    populateDatalist(query, this.suwar, false, this.surahDatalist);
  }

  private validateAyah() {
    const val = parseInt(this.ayahInput.value);
    const max = parseInt(this.ayahInput.max);

    if (isNaN(val)) return;
    if (val < 1) this.ayahInput.value = "1";

    if (val > max) {
      this.ayahInput.value = max.toString();
      this.showError(this.ayahError, `Max ayah is ${max}`);
    } else {
      this.hideError(this.ayahError);
    }
  }

  private preventEnter(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  }

  private allowOnlyDigits(e: KeyboardEvent) {
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight"
    ) {
      return;
    }
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  }

  private showError(errorElement: HTMLElement, message: string) {
    errorElement.textContent = message;
    errorElement.classList.add("visible");
  }

  private hideError(errorElement: HTMLElement) {
    errorElement.textContent = "";
    errorElement.classList.remove("visible");
  }

  getSurahID(): number | null {
    const value = this.surahInput.dataset.number;
    return value ? parseInt(value) : null;
  }
  getLocalAyahID(): number | null {
    const value = this.ayahInput.value;
    return value ? parseInt(value) : null;
  }
  getGlobalAyahID(): number | null {
    const surahID = this.getSurahID();
    const localAyahID = this.getLocalAyahID();
    if (surahID && localAyahID) {
      return getGlobalID(surahID, localAyahID, this.suwar);
    }
    return null;
  }
}
