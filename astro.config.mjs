// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: 'https://CODEsignLabsCA.github.io',
  i18n: {
    locales: ["en", "es"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [tailwind(), react()],
  vite: {
    resolve: {
      alias: {
        "@": "/src",
        "@components": "/src/components",
      },
    },
    // TRUCO DE INGENIERÍA: Incrustar tokens físicos de Telegram durante la compilación estática
    define: {
      'import.meta.env.PUBLIC_TELEGRAM_BOT_TOKEN': JSON.stringify(process.env.PUBLIC_TELEGRAM_BOT_TOKEN),
      'import.meta.env.PUBLIC_TELEGRAM_CHAT_ID': JSON.stringify(process.env.PUBLIC_TELEGRAM_CHAT_ID),
    },
  },
  output: "static",
  build: {
    inlineStylesheets: "auto",
  },
  server: {
    host: true,
    port: 4321,
  },
});
