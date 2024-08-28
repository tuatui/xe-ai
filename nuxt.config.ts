// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  build: { transpile: ["vuetify"] },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        config.plugins?.push(vuetify({ autoImport: true }));
      });
    },
    "@pinia/nuxt",
    "@unocss/nuxt",
    "@vueuse/nuxt",
  ],
  vite: { vue: { template: { transformAssetUrls } } },
  css: ["~/assets/main.css"],
});
