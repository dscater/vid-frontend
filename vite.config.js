// vite.config.js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import AutoImport from "unplugin-auto-import/vite";
// Importamos el plugin PWA
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    // Configuración del plugin VitePWA
    VitePWA({
      navigateFallback: "/index.html",

      registerType: "autoUpdate",
      // Configuración de Workbox (caching)
      workbox: {
        globDirectory: "dist",
        globPatterns: [
          "**/*.{js,css,html,ico,png,jpg,jpeg,svg}",
          "assets/*.{js,css}",
        ],

        // Esto asegura que la navegación a cualquier URL cargue el index.html
        navigateFallback: "index.html",

        // Esto es útil si tienes muchas rutas lazy-loaded
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === "style" ||
              request.destination === "script" ||
              request.destination === "worker",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-resources",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages-cache",
            },
          },
          {
            urlPattern: ({ request }) =>
              ["script", "style", "image", "font"].includes(
                request.destination
              ),
            handler: "CacheFirst",
            options: {
              cacheName: "assets-cache",
            },
          },
          {
            urlPattern: /^.*\.js$/, // Captura cualquier petición .js
            handler: "CacheFirst",
            options: {
              cacheName: "js-assets-cache",
            },
          },
          {
            urlPattern: /.*\.js$/,
            handler: "CacheFirst",
            options: {
              cacheName: "js-chunks",
              expiration: { maxEntries: 100 },
            },
          },
          {
            urlPattern: /.*\.html$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "html-cache",
            },
          },
        ],
      },
      // Configuración del Manifiesto de la PWA
      manifest: {
        name: "VID App",
        short_name: "VID",
        description: "App de prueba con sincronización offline.",
        theme_color: "#004a93",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
