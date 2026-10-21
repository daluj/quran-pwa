// Shown on the Settings page. Keep in sync with data/raw/SOURCES.md.
export const SOURCES = {
  arabic: {
    name: 'Tanzil Quran Text (Uthmani, version 1.1)',
    url: 'https://tanzil.net',
    license: 'Creative Commons Attribution 3.0',
  },
  translations: {
    // TODO: placeholder until the translation's details are confirmed.
    en: {
      name: 'Example English Translation (placeholder)',
      translator: 'Unknown Translator (placeholder)',
      license: 'Unknown (placeholder)',
      note: undefined as string | undefined,
    },
    es: {
      name: 'Spanish (Spain) translation',
      translator: 'Claude (Anthropic), from the Arabic',
      license: 'Made for this project',
      note: 'Machine translation, not yet reviewed by a qualified reader of Arabic.',
    },
  },
}
