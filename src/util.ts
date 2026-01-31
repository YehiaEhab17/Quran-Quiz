import { Surah, Ayah, Ruku } from "./types.js";

export function findSurah(input: string, suwar: Surah[]): Surah[] {
  const query: string = input.trim().toLowerCase();

  if (!query) {
    return [];
  }
  return suwar.filter(
    (s) =>
      s.display.toLowerCase() === query ||
      s.number.toString().includes(query) ||
      s.english.toLowerCase().includes(query) ||
      s.arabic.includes(query),
  );
}

export function findAyah(
  surahNumber: number,
  ayahNumber: number,
  ayaat: Ayah[],
): Ayah | undefined {
  return ayaat.find((a) => a.surah === surahNumber && a.ayah === ayahNumber);
}

export function populateDatalist(
  query: string,
  suwar: Surah[],
  surahDatalist: HTMLDataListElement,
): void {
  const matches = query.trim() ? findSurah(query, suwar) : suwar;

  surahDatalist.innerHTML = "";
  const fragment = document.createDocumentFragment();

  matches.forEach((s) => {
    const option = document.createElement("option");
    option.value = `${s.number}. ${s.arabic} (${s.english})`;
    fragment.appendChild(option);
  });
  surahDatalist.appendChild(fragment);
}

export function getRukuWithinRange(start: Ayah, end: Ayah): number {
  const startRuku = start.ruku;
  const endRuku = end.ruku;

  const ruku = startRuku + Math.floor(Math.random() * (endRuku - startRuku + 1));
  return ruku;
}

export function getRuku(rukuNumber: number, ayaat: Ayah[]): Ruku | undefined {
  const ayaatInRuku = ayaat.filter((ayah) => ayah.ruku === rukuNumber);
  return ayaatInRuku.length > 0 ? { id: rukuNumber, ayaat: ayaatInRuku } : undefined;
}

export function getArabicDigit(num: number): string {
  return num.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
}

export function concatenateAyaat(ayaat: Ayah[]): string {
  if (ayaat.length === 0) return "";
  let combinedText = ayaat[0].text;

  for (let i = 1; i < ayaat.length; i++) {
    combinedText += ` ${getArabicDigit(ayaat[i - 1].ayah)} ${ayaat[i].text}`;
  }
  return combinedText;
}

export function clamp(min: number, value: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    console.log("Copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
}
