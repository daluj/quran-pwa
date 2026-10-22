# Data sources

Files in this folder are imported as-is and never edited by hand.
`scripts/build-quran-data.ts` reads them and generates `src/data/*.json`.

## Arabic text — `quran-uthmani.txt`

- **Name:** Tanzil Quran Text (Uthmani, Version 1.1)
- **Source:** Tanzil Project — https://tanzil.net
- **Format:** "Text (with aya numbers)" — `surah|ayah|text`, one verse per line
- **License:** Creative Commons Attribution 3.0. Verbatim copies may be
  distributed; the source (Tanzil Project) must be clearly indicated with a link
  to tanzil.net. The full copyright block is kept at the end of the file.
- **Processing note:** in this text the Bismillah is prefixed to verse 1 of
  every surah except surah 1 (where it *is* verse 1) and surah 9 (which has
  none). The build script removes that prefix from verse 1 of surahs 2–114
  (except 9) so the Bismillah is shown once, in the surah header, matching the
  translation's verse boundaries. The raw file is not modified.

## Arabic font — `src/assets/fonts/UthmanicHafs1Ver18.woff2`

- **Name:** KFGQPC Uthmanic Hafs (version 18), the font Quran.com uses for the
  Uthmani script
- **Source:** King Fahd Glorious Quran Printing Complex (https://qurancomplex.gov.sa),
  copied from https://quran.com/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2
  on 2026-10-22
- **License:** **to confirm.** KFGQPC publishes it for free use in Quran
  applications; check the terms on qurancomplex.gov.sa before a public release.
  The file is used unmodified.
- **Why:** Amiri Quran misplaced dagger alifs, hamzas and small marks in some
  verses (e.g. 2:104). Amiri Quran stays as the fallback.
- **Processing note:** the font draws Tanzil's U+06DF (small high rounded zero)
  as a dotted circle and has the mark at U+06E0, so the app swaps the two when
  *showing* text (`forDisplay` in `src/lib/arabic.ts`). The data and search are
  unchanged.

## Spanish translation — `es.translation.txt`

- **Name:** Spanish (Spain) translation, made for this project
- **Translator:** Claude (Anthropic), translating directly from
  `quran-uthmani.txt` with the owner's guidelines; not derived from the
  English file
- **Status:** machine translation; to be reviewed by a qualified reader of
  Arabic before it's presented as authoritative. Guidelines, terminology
  decisions and contested verses are in
  [`specs/2026-10-21-spanish-translation/`](../../specs/2026-10-21-spanish-translation/)
- **Format:** same as the English file — `surah|ayah|text`, one verse per
  line, 6236 lines; 1:1 is the Bismillah, and verse 1 of the other surahs
  doesn't repeat it

## English translation — `en.translation.txt`

> **TODO — placeholder data.** Replace with the real details before relying on
> this translation being redistributable.

- **Name:** Example English Translation (placeholder)
- **Translator:** Unknown Translator (placeholder)
- **Source:** https://example.com (placeholder)
- **License:** Unknown (placeholder)
- **Format:** "Text (with aya numbers)" — `surah|ayah|text`, one verse per line

## Word audio — `https://audio.qurancdn.com/wbw/`

Not a file in this folder: the app plays it from the network.

- **Name:** Quran.com word-by-word audio
- **Source:** Quran.com's CDN, one MP3 per word:
  `https://audio.qurancdn.com/wbw/SSS_AAA_WWW.mp3` (surah, ayah and word
  position, zero-padded to three digits; `002_101_001.mp3` is the first word
  of 2:101). Checked on 2026-10-22.
- **License:** **to confirm.** The CDN states none. Check Quran.com's terms
  (https://quran.com) and, if needed, ask them before a public release.
- **Numbering:** word *n* is the *n*th space-separated word of the Tanzil
  text. Six verses disagree with the audio's count (2:181, 8:6, 12:8, 13:37,
  37:130, 79:1); they are listed in `src/data/word-audio-exceptions.json` and
  have no word audio. Regenerate with `npm run verify:word-audio`.
- **Offline:** words the user plays are cached in the browser (`word-audio`
  cache, up to 1500 files for 30 days); nothing is bundled.
