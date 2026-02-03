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

export interface Ruku {
  id: number;
  startIndex?: number;
  ayaat: Ayah[];
}

export interface TranslationItem {
  english: string;
  arabic: string;
}

export interface TranslationParagraph {
  english: string[];
  arabic: string[];
}
export interface TranslationData {
  pageTitle: TranslationItem;
  mainHeading: TranslationItem;
  labels: {
    startSurah: TranslationItem;
    startAyah: TranslationItem;
    endSurah: TranslationItem;
    endAyah: TranslationItem;
  };
  buttons: {
    startQuiz: TranslationItem;
    stopQuiz: TranslationItem;
    showMore: TranslationItem;
    showLess: TranslationItem;
    nextQuiz: TranslationItem;
    copyAyah: TranslationItem;
    revealSurah: TranslationItem;
    revealAyah: TranslationItem;
    copied: TranslationItem;
    translate: TranslationItem;
  };
  errors: {
    invalidSurah: TranslationItem;
    invalidAyahRange: TranslationItem;
    swappedAyahs: TranslationItem;
  };
  information: {
    title: TranslationItem;
    content: TranslationParagraph;
    warning: TranslationParagraph;
  };
  dynamic: {
    ayahPrefix: TranslationItem;
    to: TranslationItem;

    inputModes: {
      ayah: TranslationItem;
      surah: TranslationItem;
      juz: TranslationItem;
      hizb: TranslationItem;
    };
  };
  report: {
    title: TranslationItem;
    question: TranslationItem;
    surah: TranslationItem;
    fromAyah: TranslationItem;
    mistakes: TranslationItem;
    totalMistakes: TranslationItem;
  };
}

export interface QuestionReport {
  surah: Surah;
  ruku: Ruku;
  mistakes: number;
}
