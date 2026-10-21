# Spanish Translation (data) — Plan

## 1. Guidelines and decisions

- [x] Record the owner's guidelines and the terminology decisions in
      [`requirements.md`](requirements.md)
- [x] Owner reviews surahs 1–2 and the decisions before the rest is translated

## 2. Translation

Translated from `data/raw/quran-uthmani.txt` surah by surah, then
concatenated into `data/raw/es.translation.txt`.

- [x] Surahs 1–2 (293 verses)
- [x] Surahs 3–9
- [x] Surahs 10–20
- [x] Surahs 21–39
- [x] Surahs 40–66
- [x] Surahs 67–114

## 3. Contested verses

Verses where readings differ widely. Each is translated literally (see
requirements, "Contested verses"); the note says which word was chosen and
why, so a reviewer can find them quickly.

| Verse | Word | Chosen | Note |
| --- | --- | --- | --- |
| 2:54 | *fa-qtulū anfusakum* | matad vuestras almas | Literal; *nafs* is *alma* throughout. Read by some as "kill your egos", by others as "kill one another". |
| 2:78 | *ummiyyūn* | gentiles | The Quran contrasts *ummiyyūn* with the people of the Scripture (3:20, 3:75, 62:2): those without a scripture, not "illiterate". Same choice in 7:157–158 (*al-nabī al-ummī*). |
| 2:104 | *rāʿinā* / *unẓurnā* | «Ra'ina» / «Míranos» | *rāʿinā* left untranslated: the point is its double meaning (4:46). |
| 2:106 | *nansakh* | abrogamos | Literal; *āya* kept as *señal*, as everywhere. |
| 2:184 | *yuṭīqūnahu* | quienes pueden hacerlo | Literal meaning of the verb, without adding "with difficulty". |
| 2:256–257 | *al-ṭāghūt* | el Taghut | Untranslated (guideline 5): in 4:60 it is something people seek judgement from, so "idols" is too narrow. |
| 2:260 | *fa-ṣurhunna ilayka* | atráelas hacia ti | Rare verb; "cut them up" is a common reading but not what the root says. |
| 4:3 | *allā taʿūlū* | para no desviaros | Literal meaning of *ʿāla*; "so you won't have many dependants" is a later reading. |
| 4:24 | *istamtaʿtum* | aquellas con las que disfrutéis | Literal; no legal category added. |
| 4:34 | *qawwāmūn*, *nushūz*, *iḍribūhunna* | responsables de, mala conducta, golpeadlas | *Nushūz* is used of husbands too (4:128), so it is not rendered as "disobedience". *Ḍaraba* with a personal object is "strike" elsewhere (8:12, 8:50, 47:27). |
| 5:38 | *fa-qṭaʿū aydiyahumā* | cortadles las manos | Literal. |
| 9:5, 9:29 | *jizya* | yizia | Untranslated (guideline 5); the rest is literal. |
| 15:87 | *sabʿan min al-mathānī* | siete de las reiteradas | Literal; not identified with any surah. |
| 15:99 | *al-yaqīn* | la certeza | Literal; "death" is an interpretation. |
| 22:52 | *tamannā* | cuando deseaba algo | Literal meaning of the verb; "when he recited" is interpretive. |
| 24:2 | *fa-jlidū* | azotad | Literal. |
| 24:31 | *khumur*, *juyūb* | que echen sus velos sobre sus escotes | Literal. |
| 33:33 | *wa-qarna fī buyūtikunna* | permaneced en vuestras casas | Literal; addressed to the prophet's wives. |
| 33:59 | *jalābīb* | que se ciñan los mantos | Literal. |
| 47:4 | *fa-ḍarb al-riqāb*, *mannan*, *fidāʾ* | golpead los cuellos; liberación por gracia o rescate | Literal. |
| 57:27 | *rahbāniyya* | el monacato lo inventaron ellos; no se lo prescribimos, sino buscando la complacencia de Dios | Word order kept; the exception clause stays as ambiguous as in the Arabic. |
| 65:4 | *wa-llāʾī lam yaḥiḍna* | y también las que no han menstruado | Literal; no age or condition added. |
| 101:9 | *fa-ummuhu hāwiya* | su madre será un precipicio | Literal; 101:10 asks what "it" is, so the word stays a common noun. |
| 108:1 | *al-kawthar* | la Abundancia | Hapax; root *k-th-r* (abundance). |
| 112:2 | *al-ṣamad* | el Absoluto | Hapax; no single Spanish equivalent ("the one all depend on, who depends on none"). |

## 4. Validation and close

- [x] Every verse key of the Arabic file present once, in order (6236 lines)
- [x] No brackets or parentheses; no empty verses; no surah names
- [x] Terminology spot checks (see [`validation.md`](validation.md))
- [x] `data/raw/SOURCES.md` describes the file; roadmap and changelog updated
