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
- **Not used by the app yet:** the build script doesn't read this file

## English translation — `en.translation.txt`

> **TODO — placeholder data.** Replace with the real details before relying on
> this translation being redistributable.

- **Name:** Example English Translation (placeholder)
- **Translator:** Unknown Translator (placeholder)
- **Source:** https://example.com (placeholder)
- **License:** Unknown (placeholder)
- **Format:** "Text (with aya numbers)" — `surah|ayah|text`, one verse per line
