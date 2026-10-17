import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Generates PWA icons from public/favicon.svg: `npm run icons`.
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, padding: 0.3, resizeOptions: { background: '#0f766e' } },
    apple: { ...minimal2023Preset.apple, padding: 0.3, resizeOptions: { background: '#0f766e' } },
  },
  images: ['public/favicon.svg'],
})
