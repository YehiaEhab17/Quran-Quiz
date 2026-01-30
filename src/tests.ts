import { getGlobalID } from "./util.js";
import { Surah, Ayah } from "./types.js";

export function testGlobalIDMapping(suwar: Surah[], ayaat: Ayah[]) {
  let totalTests = 0;
  let passedTests = 0;
  let ayahCounter = 0; // This will track our position in the flat ayaat array

  console.log("Starting validation test...");

  for (let s = 0; s < suwar.length; s++) {
    const currentSurah = suwar[s];

    for (let a = 1; a <= currentSurah.length; a++) {
      totalTests++;

      // 1. Calculate the ID using your function
      const calculatedID = getGlobalID(currentSurah.number, a, suwar);

      // 2. Get the actual ID from the flat database
      const actualID = ayaat[ayahCounter].id;

      // 3. Compare
      if (calculatedID === actualID) {
        passedTests++;
      } else {
        console.error(`❌ Mismatch at Surah ${currentSurah.number}, Ayah ${a}`);
        console.error(`Expected: ${actualID}, Got: ${calculatedID}`);
        return; // Stop on first error
      }

      ayahCounter++;
    }
  }

  console.log(`✅ Test Complete! Passed ${passedTests} / ${totalTests} verses.`);
}
