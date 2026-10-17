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

## English translation — `en.translation.txt`

> **TODO — placeholder data.** Replace with the real details before relying on
> this translation being redistributable.

- **Name:** Example English Translation (placeholder)
- **Translator:** Unknown Translator (placeholder)
- **Source:** https://example.com (placeholder)
- **License:** Unknown (placeholder)
- **Format:** "Text (with aya numbers)" — `surah|ayah|text`, one verse per line
