import fs from "fs";

async function collectAyaat() {
  console.log("Fetching Quran data...");

  // We fetch the 'quran-simple' edition because it contains the ruku/hizb/juz metadata
  const response = await fetch("https://api.alquran.cloud/v1/quran/quran-simple");
  const data = await response.json();

  if (data.code !== 200) {
    console.error("Failed to fetch data from API");
    return;
  }

  const Ayaat = [];
  let globalId = 1;

  data.data.surahs.forEach((surah) => {
    surah.ayahs.forEach((ayah) => {
      Ayaat.push({
        id: globalId,
        surah: surah.number,
        ayah: ayah.numberInSurah,
        text: ayah.text,
        ruku: ayah.ruku,
        hizb: ayah.hizbQuarter, // This is useful for hifz students
        juz: ayah.juz,
      });
      globalId++;
    });
  });

  fs.writeFileSync("dist/ayaat.json", JSON.stringify(Ayaat, null, 2));
  console.log(`Success! Created flat list with ${Ayaat.length} ayahs.`);
}

collectAyaat();
