import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite' // Idagdag ito!

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Isama ito sa plugins list
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto', // Mahalaga para sa automatic registration
      devOptions: {
        enabled: true, // I-true muna natin para makita natin kung gagana sa localhost
        type: 'module'
      },
      manifest: {
        name: 'ExpensePal',
        short_name: 'ExpensePal',
        description: 'Know the true labor cost of your lifestyle.',
        theme_color: '#001B3D',
        background_color: '#001B3D',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})