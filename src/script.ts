console.log("js working");

const startSurahInput = document.getElementById("start-surah") as HTMLInputElement;
const startAyahInput = document.getElementById("start-ayah") as HTMLInputElement;
const endSurahInput = document.getElementById("end-surah") as HTMLInputElement;
const endAyahInput = document.getElementById("end-ayah") as HTMLInputElement;
const userInput = document.getElementById("selection-form") as HTMLFormElement;
const surahDatalist = document.getElementById("surah-names") as HTMLDataListElement;

interface Surah {
  display: string;
  arabic: string;
  english: string;
  number: number;
  length: number;
}

let suwar: Surah[] = [];

const dependancyMap = new Map<HTMLInputElement, HTMLInputElement>([
  [startSurahInput, startAyahInput],
  [endSurahInput, endAyahInput],
]);

async function init() {
  const response = await fetch("dist/suwar.json");
  suwar = await response.json();

  dependancyMap.forEach((dependant, input) => {
    input.addEventListener("focus", () => {
      input.select();
      populateDatalist("", true);
    });

    input.addEventListener("blur", () => {
      const surah = findSurah(input.value);
      if (surah.length === 0) {
        input.value = "";
        dependant.disabled = true;
      } else {
        input.value = surah[0].display;
        dependant.disabled = false;
        dependant.max = surah[0].length.toString();
        console.log(input.name, surah);
      }
    });

    input.addEventListener("input", () => {
      const query = input.value.trim().toLowerCase();
      populateDatalist(query);
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

function findSurah(input: string, all: boolean = false): Surah[] {
  const query: string = input.trim().toLowerCase();
  if (all) {
    return suwar;
  }
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

function populateDatalist(query: string, all: boolean = false): void {
  const matches = findSurah(query, all);

  surahDatalist.innerHTML = "";

  matches.forEach((s) => {
    const option = document.createElement("option");
    option.value = `${s.number}. ${s.arabic} (${s.english})`;
    surahDatalist.appendChild(option);
  });
}
