import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'Figurama — Trocas da Copa 2026',
        short_name: 'Figurama',
        description:
          'Marque suas figurinhas da Copa 2026, ache trocas perfeitas e complete seu álbum.',
        theme_color: '#FF6B2C',
        background_color: '#FFF8F0',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'pwa-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/u\//], // páginas públicas de lista renderizam fresh
        runtimeCaching: [
          {
            // fotos de jogadores (Wikimedia Commons) — cache longo
            urlPattern: ({ url }) => url.hostname.endsWith('wikimedia.org'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'player-photos',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // respostas da API da Wikipédia (URLs das fotos)
            urlPattern: ({ url }) => url.hostname.endsWith('wikipedia.org'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'wiki-api',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
})
