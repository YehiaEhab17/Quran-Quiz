// build-ruku-index.js
const fs = require("fs");

async function buildRukuIndex() {
  console.log("Fetching full Quran metadata...");

  // We use the 'quran-simple' edition because it's lightweight (text only, no audio/transliteration)
  const response = await fetch("http://api.alquran.cloud/v1/quran/quran-simple");
  const data = await response.json();

  if (data.code !== 200) {
    console.error("Error fetching data");
    return;
  }

  const rukuIndex = [];
  let currentRuku = 0;

  // Iterate through all 114 Surahs
  data.data.surahs.forEach((surah) => {
    // Iterate through every Ayah in the Surah
    surah.ayahs.forEach((ayah) => {
      // The API provides a 'ruku' field for every single ayah
      if (ayah.ruku > currentRuku) {
        // We found a new Ruku! Record its starting position.
        rukuIndex.push({
          id: ayah.ruku,
          surah: surah.number,
          ayah: ayah.numberInSurah,
        });
        currentRuku = ayah.ruku;
      }
    });
  });

  // Save the result
  fs.writeFileSync("dist/ruku_index.json", JSON.stringify(rukuIndex, null, 2));
  console.log(`Success! Generated index for ${rukuIndex.length} Rukus.`);
  console.log(`Saved to dist/ruku_index.json`);
}

buildRukuIndex();
