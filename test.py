import requests
import random

def get_random_context_quiz():
    ruku_number = random.randint(1, 558)
    url = f"http://api.alquran.cloud/v1/ruku/{ruku_number}/quran-uthmani"

    response = requests.get(url)
    data = response.json()

    ayahs = data['data']['ayahs']

    first_ayah = ayahs[0]

    starting_text = first_ayah['text']
    starting_num = first_ayah['numberInSurah']

    surah_name = first_ayah['surah']['englishName']

    return starting_text, starting_num, surah_name

text, num, surah = get_random_context_quiz()

print(f"Context starts at {surah} Ayah {num}:")
print(f"'{text}...'")
