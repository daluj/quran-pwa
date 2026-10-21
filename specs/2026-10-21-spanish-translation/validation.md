# Spanish Translation (data) — Validation

## Automated checks

- [x] `data/raw/es.translation.txt` has 6236 lines, `surah|ayah|text`, ending
      with a newline
- [x] Its keys match `quran-uthmani.txt` exactly, in the same order
- [x] No line has an empty text, and no text contains `[`, `]`, `(` or `)`
- [x] `npm run data` still reports the same data version hash (the build does
      not read the Spanish file yet, so nothing else changes)

```bash
diff <(cut -d'|' -f1,2 data/raw/es.translation.txt) <(grep -E '^[0-9]+\|' data/raw/quran-uthmani.txt | cut -d'|' -f1,2)
grep -c '[][()]' data/raw/es.translation.txt   # expect 0
awk -F'|' 'NF!=3 || $3==""' data/raw/es.translation.txt   # expect nothing
```

## Terminology spot checks

- [x] *al-Raḥmān* is *el Todopoderoso* in 1:1, 1:3, 19:18, 19:45, 19:88–93,
      20:108, 21:42, 36:11, 36:23, 50:33, 67:20
- [x] No *Alá*, *Clemente*, *Compasivo* for *al-Raḥmān*, or surah names
- [x] *al-ṣalāt*, *al-zakāt* untranslated everywhere
- [x] Spain register (*vosotros*) throughout

## Review

- [ ] Owner has read a sample of surahs and the contested-verses table
- [ ] Reviewed by a qualified reader of Arabic before the translation is
      shown in the app as authoritative (can happen after this phase)

## Definition of Done

All automated checks and spot checks pass, the decisions in
`requirements.md` match the text, and the owner has reviewed the work.
