# Spanish Translation (data) — Requirements

## Scope

A complete Spanish (Spain) translation of the Quran, made directly from the
Arabic text in `data/raw/quran-uthmani.txt` (Tanzil Uthmani 1.1), saved as
`data/raw/es.translation.txt`.

- **Format:** identical to `en.translation.txt`: `surah|ayah|text`, one verse
  per line, 6236 lines, UTF-8, ending with a newline. Verse numbering follows
  the Tanzil (Kufan) numbering of the Arabic file.
- **Bismillah:** as in the English file, 1:1 is the Bismillah; verse 1 of
  surahs 2–114 does not repeat it (the Arabic file prefixes it, the build
  script strips it).
- **Out of scope:** wiring the file into the app (build script, data model,
  language setting). That is a separate phase.

## Owner's guidelines

These are the rules the owner set for the translation (2026-10-21), kept here
as the reference for any future revision.

1. **Purpose.** Convey the exact message of the original Arabic text in
   contemporary, reader-friendly Spanish.
2. **A translation, not an interpretation.** No personal understanding of any
   author; only an exact representation of the Arabic text. No additions of
   any kind to the text itself.
3. **No ideology, culture or current trends.** The Quran is for all people,
   places and times; translating it in line with current culture or trends
   compromises that universality.
4. **Spanish grammar.** Word-for-word translation can be incomprehensible.
   Where Arabic word order differs from Spanish, minor positional changes are
   allowed as long as the meaning is not altered.
5. **Words without a Spanish equivalent.** Use a combination of Spanish words
   to convey the meaning; when no combination can express it, leave the word
   untranslated.
6. **No words added or removed.** Nothing that is not in the Arabic is added,
   and nothing in the Arabic is removed. **No words in brackets** (nor in
   parentheses) anywhere.
7. **The Quran is its own dictionary.** Translate each word according to how
   the Quran itself uses it; when the Quranic meaning differs from the common
   meaning, use the Quranic one, i.e. the meaning that is in harmony with all
   the verses where the word appears. For words used only once
   (hapax legomena), use the translation that agrees with the spirit of the
   verse and the overall message of the Quran.
8. **Al-Rahman.** Usual renderings (Most Gracious, Compassionate, Beneficent)
   all point to mercy, but the verses where the name is used consistently
   portray might and absolute power: 19:18, 19:45, 36:11, 50:33, 19:88–92,
   36:23, 19:93, 20:108, 67:20, 21:42.

## Decisions

Decisions taken while applying the guidelines. If one changes, update it here
first, then the text.

### Register and typography

- **Spanish from Spain:** second person plural is *vosotros* (*creed*,
  *vosotros sabéis*); God addressed in the second person is *Tú* (capitalised,
  like *Él*, *Su*, *Le* when they refer to God, to tell them apart from human
  referents in long verses).
- **Divine plural:** the Arabic first person plural used by God (*naḥnu*, *-nā*)
  is kept as *Nosotros* / *Nos* / *Nuestro* (capitalised), not changed to
  singular.
- **Quotes:** Spanish angle quotes «…», with “…” for a quote inside a quote.
  Opening ¿ and ¡ as Spanish requires.
- **Disjoined letters** (*al-muqaṭṭaʿāt*) are left untranslated and
  transliterated by letter name: *Alif. Lam. Mim.*, *Ta. Ha.*, *Qaf.*

### Names of God

| Arabic | Spanish | Why |
| --- | --- | --- |
| Allāh | Dios | The proper name of God; *Dios* is its Spanish equivalent and matches the English file ("God"). |
| al-Raḥmān | el Todopoderoso | Guideline 8: the verses listed show might and absolute power. Matches the English file ("the Almighty"). |
| al-Raḥīm | el Misericordioso | Its uses are consistently about mercy. |
| rabb | Señor | |
| ilāh | dios | Lowercase: any object of worship. |
| al-ʿAzīz, al-Ḥakīm, al-ʿAlīm, … | el Poderoso, el Sabio, el Conocedor, … | Rendered as adjectives/titles; capitalised when used as a name of God. |

### Recurring terms

| Arabic | Spanish | Note |
| --- | --- | --- |
| al-ṣalāt | la Salat | Untranslated (guideline 5): a specific act defined by the Quran; *oración* means *duʿāʾ*. *Aqāma al-ṣalāt* → *observar la Salat*. |
| al-zakāt | la Zakat | Untranslated (guideline 5). |
| al-ḥajj, al-ʿumra | el Hajj, la Umrah | Untranslated (guideline 5). |
| al-islām / muslim | la Sumisión / sometido(s) | The Quran applies it to Abraham, Noah, Jesus' disciples, etc.: submission to God, not the later name of a community. |
| al-dīn | la religión; *yawm al-dīn* → el Día del Juicio | In *yawm al-dīn* the Quran uses *dīn* as judgement/requital (82:17–19, 37:53, 51:6). |
| taqwā / muttaqūn / ittaqū | reverencia / los reverentes / reverenciad | One root, one Spanish family. When the object is not God (*ittaqū al-nār*, *ittaqū yawman*) → *guardaos de*. |
| ḥanīf | monoteísta puro | Always paired with "not of the associators". |
| milla | credo | *millat Ibrāhīm* → *el credo de Abraham*. |
| qibla | alquibla | Spanish word (RAE) for it. |
| al-ṭāghūt | el Taghut | Untranslated: see contested verses in `plan.md`. |
| ummī / ummiyyūn | gentil / gentiles | See contested verses in `plan.md`. |
| kursī / ʿarsh | Sede / Trono | Two different words, kept apart. |
| al-maʿrūf | como es debido; *qawl maʿrūf* → palabras decorosas | What is recognised as right. |
| jāhada / jihād | esforzarse / esfuerzo | Literal; *qātala* is *combatir*. |
| ʿabd (of God) / ʿabd (of a person) | siervo / esclavo | |
| kufr / kāfirūn / alladhīna kafarū | incredulidad / los incrédulos / los que no creyeron (no creen) | |
| shirk / mushrikūn | asociar / los asociadores | Associating partners with God. |
| āya / āyāt | señal / señales | The Quran uses the same word for signs in creation and in revelation. |
| al-kitāb / ahl al-kitāb | la Escritura (el Libro) / la gente de la Escritura | *el Libro* when it refers to a specific book (2:2). |
| rasūl / nabī | mensajero / profeta | |
| al-qurʾān | el Corán | |
| al-shayṭān / al-shayāṭīn | Satanás / los demonios | |
| iblīs | Iblís | Proper name, untranslated. |
| al-jinn | los yinn | No Spanish equivalent; Spanish transliteration. |
| al-malāʾika | los ángeles | |
| al-rūḥ | el Espíritu | |
| al-janna / jannāt | el Jardín / jardines | *el Paraíso* only for *al-firdaws*. |
| jahannam / al-nār / al-jaḥīm / saʿīr | el Infierno / el Fuego / el Abismo / el Fuego ardiente | Distinct words kept distinct. |
| yawm al-qiyāma / yawm al-faṣl | el Día de la Resurrección / el Día de la Decisión | |
| al-ākhira | la Otra Vida | |
| fī sabīl Allāh | en el camino de Dios | Literal; *causa* would be interpretive. |
| al-masjid al-ḥarām | la Mezquita Sagrada | |
| al-ghayb | lo oculto | |
| ẓulm / ẓālimūn | injusticia / los injustos | |
| ṣabr | paciencia / constancia | Same word, chosen by context. |
| ḥūr ʿīn | compañeras de ojos grandes y hermosos | Combination of words (guideline 5). |
| raʾūf | Compasivo | Kept apart from *raḥīm* (Misericordioso); never used for *al-Raḥmān*. |
| ṣallā / al-muṣallūn | hacer la Salat / los que hacen la Salat | Same untranslated noun as *al-ṣalāt*. |
| mā malakat aymānukum | las que posee vuestra diestra | Literal. |
| sūra | sura | Spanish word (RAE) for it. |
| al-jizya | la yizia | Untranslated (guideline 5); Spanish transliteration. |
| rūḥ al-qudus | el Espíritu de Santidad | Literal. |
| al-aʿrāf / al-aʿrāb | las alturas / los beduinos | Literal. |
| al-mathānī | las reiteradas | Literal (15:87, 39:23). |
| ālāʾ | beneficios | The refrain of surah 55: «¿Cuál, pues, de los beneficios de vuestro Señor desmentiréis los dos?». |

### Proper names

Prophets and people known in Spanish keep their usual Spanish form: Adán,
Noé, Abraham, Ismael, Isaac, Jacob, José, Moisés, Aarón, David, Salomón, Job,
Jonás, Elías, Eliseo, Zacarías, Juan, Jesús, María, Lot, Faraón (a title used
as a name in the Quran, so without article). Names with no usual Spanish form
are transliterated: Hud, Salih, Shuayb, Idrís, Dhul-Kifl, Luqman,
Dhul-Qarnayn, Iblís, Haman, Qarún, Yayuy y Mayuy, ʿAd → Ad, Thamud, Madián.
Ṭālūt is kept as Talut (the Quran's account doesn't match Saul's closely
enough to substitute the name); Jālūt is Goliat. ʿUzayr, Tubbaʿ, Iram,
Quraysh, Abu Lahab, Malik (the guardian in 43:77), Zaqqum, Saqar, Siyyín,
Illiyyún, Salsabil and Tasnim are transliterated, as are the idols al-Lat,
al-Uzza, Manat, Baal, Wadd, Suwa, Yaguz, Yauq and Nasr. Places: Meca (48:24) / Bakka (3:96, kept as written), Medina / Yazrib (33:13),
Badr, Hunayn.

### Contested verses

Some verses are the subject of long-standing disagreement. Following
guidelines 2, 3 and 7, they are translated literally, with the word chosen by
its use across the Quran rather than by any school or current opinion. They
should be the first ones reviewed by a qualified reader of Arabic. The list
is kept in [`plan.md`](plan.md) (task group 3) as it is filled in.

## Context

- The English file's source and license are unknown (see
  `data/raw/SOURCES.md`). The Spanish translation is made from the Arabic
  only, not from the English, so it doesn't depend on that license.
- It's a machine-produced translation (Claude) following these rules. It
  should be reviewed by a qualified reader of Arabic before being presented to
  users as authoritative.
