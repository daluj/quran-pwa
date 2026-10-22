/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      // Everything in public/ is already matched by globPatterns below.
      includeManifestIcons: false,
      manifest: {
        name: 'Quran',
        short_name: 'Quran',
        description: 'Read the Quran offline, save verses to collections and organize prayer verses by topic.',
        lang: 'en',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0f766e',
        background_color: '#ffffff',
        categories: ['books', 'education', 'lifestyle'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell, fonts and the full Quran JSON are precached so the app
        // works offline after the first load.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2,json}'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        // Word audio is too large to precache (~77k files): keep the words
        // the user has played. The player downloads each file whole, so the
        // cached response is a plain 200.
        runtimeCaching: [
          {
            // Surah downloads ask for no-store: they go straight to their own cache.
            urlPattern: ({ url, request }) =>
              url.origin === 'https://audio.qurancdn.com' && url.pathname.startsWith('/wbw/') && request.cache !== 'no-store',
            handler: 'CacheFirst',
            options: {
              cacheName: 'word-audio',
              expiration: { maxEntries: 1500, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
})
