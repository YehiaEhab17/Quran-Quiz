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
  ayaat: Ayah[];
}
