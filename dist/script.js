"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
console.log("js working");
const startSurahInput = document.getElementById("start-surah");
const startAyahInput = document.getElementById("start-ayah");
const endSurahInput = document.getElementById("end-surah");
const endAyahInput = document.getElementById("end-ayah");
const userInput = document.getElementById("selection-form");
const surahDatalist = document.getElementById("surah-names");
let suwar = [];
const dependancyMap = new Map([
    [startSurahInput, startAyahInput],
    [endSurahInput, endAyahInput],
]);
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("dist/suwar.json");
        suwar = yield response.json();
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
                }
                else {
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
            console.log(startSurahInput.value, startAyahInput.value, endSurahInput.value, endAyahInput.value);
        });
    });
}
init();
function findSurah(input, all = false) {
    const query = input.trim().toLowerCase();
    if (all) {
        return suwar;
    }
    if (!query) {
        return [];
    }
    return suwar.filter((s) => s.display.toLowerCase() === query ||
        s.number.toString().includes(query) ||
        s.english.toLowerCase().includes(query) ||
        s.arabic.includes(query));
}
function populateDatalist(query, all = false) {
    const matches = findSurah(query, all);
    surahDatalist.innerHTML = "";
    matches.forEach((s) => {
        const option = document.createElement("option");
        option.value = `${s.number}. ${s.arabic} (${s.english})`;
        surahDatalist.appendChild(option);
    });
}
//# sourceMappingURL=script.js.map