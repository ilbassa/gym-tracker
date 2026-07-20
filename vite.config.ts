import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const base = mode === 'github-pages' ? '/gym-tracker/' : '/'

  return {
    base,
    plugins: [
      vue(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'Gym Tracker',
          short_name: 'Gym Tracker',
          description: 'Diario personale degli allenamenti, disponibile anche offline.',
          theme_color: '#f59e0b',
          background_color: '#f5f3ef',
          display: 'standalone',
          id: `${base}#/dashboard/oggi`,
          scope: base,
          start_url: `${base}#/dashboard/oggi`,
          lang: 'it',
          icons: [
            { src: `${base}pwa-192x192.svg`, sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
            { src: `${base}pwa-512x512.svg`, sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
          ]
        },
        workbox: {
          navigateFallback: 'index.html',
          globPatterns: ['**/*.{js,css,html,svg,woff2}'],
          runtimeCaching: []
        }
      })
    ],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } }
  }
})
