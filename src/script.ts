console.log("js working");

interface Surah {
  display: string;
  arabic: string;
  english: string;
  number: number;
  length: number;
}

const startSurahInput = document.getElementById("start-surah") as HTMLInputElement;
const startAyahInput = document.getElementById("start-ayah") as HTMLInputElement;
const endSurahInput = document.getElementById("end-surah") as HTMLInputElement;
const endAyahInput = document.getElementById("end-ayah") as HTMLInputElement;
const userInput = document.getElementById("selection-form") as HTMLFormElement;
const surahDatalist = document.getElementById("surah-names") as HTMLDataListElement;

let suwar: Surah[] = [];

async function init() {
  const response = await fetch("dist/suwar.json");
  suwar = await response.json();

  [startSurahInput, endSurahInput].forEach((input) => {
    input.addEventListener("focus", () => {
      input.select();
    });

    input.addEventListener("blur", () => {
      const surah = findSurah(input.value);
      input.value = surah[0]?.display ?? "";
      console.log(input.name, surah);
    });

    input.addEventListener("input", () => {
      const query = input.value.trim().toLowerCase();
      const matches = findSurah(query);

      surahDatalist.innerHTML = "";

      matches.forEach((s) => {
        const option = document.createElement("option");
        option.value = `${s.number}. ${s.arabic} (${s.english})`;
        surahDatalist.appendChild(option);
      });

      console.log(query, matches, surahDatalist.innerHTML);
    });
  });

  userInput.addEventListener("submit", function (event) {
    event.preventDefault();

    //logic
    console.log(
      startSurahInput.value,
      startAyahInput.value,
      endSurahInput.value,
      endAyahInput.value,
    );
  });
}

init();

function findSurah(input: string): Surah[] {
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
