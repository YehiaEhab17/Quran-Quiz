import { populateDatalist, findSurah, findAyah } from "./util.js";
import { Ayah, Surah } from "./types.js";
import { appState } from "./state.js";

export class SurahAyahInputPair {
  private surahError: HTMLElement;
  private ayahError: HTMLElement;

  constructor(
    private surahInput: HTMLInputElement,
    private ayahInput: HTMLInputElement,
    private suwar: Surah[],
    private ayaat: Ayah[],
    private surahDatalist: HTMLDataListElement,
  ) {
    this.surahError = document.getElementById(`${this.surahInput.id}-error`)!;
    this.ayahError = document.getElementById(`${this.ayahInput.id}-error`)!;
    this.setupListeners();
  }

  private setupListeners() {
    this.surahInput.addEventListener("focus", this.handleFocus.bind(this));
    this.surahInput.addEventListener("blur", this.validateSurah.bind(this));
    this.surahInput.addEventListener("input", this.handleSurahInput.bind(this));

    this.ayahInput.addEventListener("input", this.validateAyah.bind(this));
    this.ayahInput.addEventListener("keydown", this.allowOnlyDigits.bind(this));
  }

  private handleFocus() {
    this.surahInput.select();
    populateDatalist("", this.suwar, this.surahDatalist);
  }

  private handleSurahInput() {
    const query = this.surahInput.value.trim().toLowerCase();
    populateDatalist(query, this.suwar, this.surahDatalist);
  }

  private validateSurah() {
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

  private allowOnlyDigits(e: KeyboardEvent) {
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "Enter"
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
  getAyah(): Ayah | undefined {
    const surahID = this.getSurahID();
    const localAyahID = this.getLocalAyahID();
    if (surahID && localAyahID) {
      return findAyah(surahID, localAyahID, this.ayaat);
    }
    return undefined;
  }

  verifyInputs(): void {
    this.validateSurah();
    this.validateAyah();
  }
}

export class QuizControls {
  private getButton(id: string): HTMLButtonElement {
    return document.getElementById(id) as HTMLButtonElement;
  }

  private buttons = {
    showMore: this.getButton("show-more"),
    showLess: this.getButton("show-less"),
    nextQuiz: this.getButton("next-quiz"),
    copyAyah: this.getButton("copy-ayah"),
    revealSurah: this.getButton("reveal-surah"),
    revealAyah: this.getButton("reveal-ayah"),
  };

  private surahRevealed: boolean = false;
  private ayahRevealed: boolean = false;

  private ayahNumber: number = 1;

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    this.buttons.showMore.addEventListener("click", this.showMore);
    this.buttons.showLess.addEventListener("click", this.showLess);
    this.buttons.nextQuiz.addEventListener("click", this.nextQuiz);
    this.buttons.copyAyah.addEventListener("click", this.copyAyah);
    this.buttons.revealSurah.addEventListener("click", this.revealSurah);
    this.buttons.revealAyah.addEventListener("click", this.revealAyah);
  }

  private showMore = () => {
    this.ayahNumber++;
    console.log("Show More clicked");
  };

  private showLess = () => {
    this.ayahNumber--;
    console.log("Show Less clicked");
  };

  private nextQuiz = () => {
    console.log("Next Quiz clicked");
  };

  private copyAyah = () => {
    console.log("Copy Ayah clicked");
  };

  private revealSurah = () => {
    this.surahRevealed = !this.surahRevealed;
    if (this.surahRevealed) {
      this.buttons.revealSurah.textContent = `Surah : ${appState.Ruku?.ayaat[0].surah}`;
    } else {
      this.buttons.revealSurah.textContent = "Reveal Surah Name";
    }
  };

  private revealAyah = () => {
    this.ayahRevealed = !this.ayahRevealed;
    if (this.ayahRevealed) {
      this.buttons.revealAyah.textContent = `Ayah : ${appState.Ruku?.ayaat[0].ayah}`;
    } else {
      this.buttons.revealAyah.textContent = "Reveal Ayah Number";
    }
  };
}
