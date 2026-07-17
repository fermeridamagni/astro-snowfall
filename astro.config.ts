import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  base: "/astro-snowfall",
  integrations: [react(), sitemap()],
  site: "https://fermeridamagni.github.io",
  vite: {
    plugins: [tailwindcss()],
  },
});
