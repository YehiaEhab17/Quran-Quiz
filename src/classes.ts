import {
  populateDatalist,
  findSurah,
  findAyah,
  concatenateAyaat,
  clamp,
  copyToClipboard,
} from "./util.js";
import { Ayah, Ruku, Surah } from "./types.js";
import { appState } from "./state.js";
import { getText } from "./translation.js";
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

  private validateAyah() {
    const val = parseInt(this.ayahInput.value);
    const max = parseInt(this.ayahInput.max);

    if (isNaN(val)) return;

    this.ayahInput.value = clamp(1, val, max).toString();

    val < 1 || val > max
      ? this.showError(this.ayahError, getText("errors.invalidAyah"))
      : this.hideError(this.ayahError);
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

  hideErrors() {
    this.hideError(this.surahError);
    this.hideError(this.ayahError);
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

  private display: AyahDisplay;

  private lastScrollTime: number = 0;

  constructor(display: AyahDisplay) {
    this.display = display;
    this.setupListeners();
  }

  private setupListeners() {
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
    });
  }

  private disableAll = (state: boolean) => {
    Object.values(this.buttons).forEach((button) => {
      button.disabled = state;
    });
  };

  private handleScroll = (e: WheelEvent) => {
    if (!appState.Started) return;
    const now = Date.now();
    if (now - this.lastScrollTime < 100) return;
    this.lastScrollTime = now;

    e.deltaY > 0 ? this.showMore() : this.showLess();
  };

  private reset = () => {
    this.buttons.revealSurah.textContent = getText("buttons.revealSurah");
    this.buttons.revealAyah.textContent = getText("buttons.revealAyah");
    this.buttons.copyAyah.textContent = getText("buttons.copyAyah");
  };

  private showMore = () => {
    this.display.incrementIndex();
  };

  private showLess = () => {
    this.display.incrementIndex(true);
  };

  private nextQuiz = () => {
    this.reset();
    window.dispatchEvent(new CustomEvent("quiz:next"));
  };

  private copyAyah = async () => {
    if (this.display.text) await copyToClipboard(this.display.text);
    this.buttons.copyAyah.textContent = getText("buttons.copied");
  };

  private revealSurah = () => {
    this.surahRevealed = !this.surahRevealed;
    if (!appState.Ruku) return;

    if (this.surahRevealed) {
      const surah = findSurah(appState.Ruku.ayaat[0].surah.toString())[0].display;
      this.buttons.revealSurah.textContent = `${surah}`;
    } else {
      this.buttons.revealSurah.textContent = getText("buttons.revealSurah");
    }
  };

  private revealAyah = () => {
    this.ayahRevealed = !this.ayahRevealed;
    if (this.ayahRevealed) {
      this.buttons.revealAyah.textContent = `Ayah ${appState.Ruku?.ayaat[0].ayah}`;
    } else {
      this.buttons.revealAyah.textContent = getText("buttons.revealAyah");
    }
  };
}

export class AyahDisplay {
  private ruku?: Ruku;
  private currentAyahIndex: number = 0;
  public text: string = "";

  constructor(private display: HTMLElement) {
    this.display = display;
  }

  setRuku(ruku: Ruku) {
    this.ruku = ruku;
    this.currentAyahIndex = 0;
    this.updateDisplay();
  }

  incrementIndex(decrement: boolean = false) {
    if (!this.ruku) return;

    this.currentAyahIndex = clamp(
      0,
      this.currentAyahIndex + (decrement ? -1 : 1),
      this.ruku.ayaat.length - 1,
    );

    this.updateDisplay();
  }

  private updateDisplay() {
    if (!this.ruku) return;
    const ayaat = this.ruku.ayaat.slice(0, this.currentAyahIndex + 1);

    this.text = concatenateAyaat(ayaat);
    this.display.textContent = this.text;
  }

  get element(): HTMLElement {
    return this.display;
  }
}
