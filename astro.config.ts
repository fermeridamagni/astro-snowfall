import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://fermeridamagni.github.io",
  base: "/astro-snowfall",
  vite: {
    plugins: [tailwindcss()],
  },
});
