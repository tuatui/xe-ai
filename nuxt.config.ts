// https://nuxt.com/docs/api/configuration/nuxt-config
import { presetUno } from "unocss";
import { locales } from "./lang/config/locales.config";
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: [
    "@pinia/nuxt",
    "@unocss/nuxt",
    "@vueuse/nuxt",
    "vuetify-nuxt-module",
    "unplugin-icons/nuxt",
    "@nuxtjs/i18n",
  ],
  vuetify: {
    // 手动控制导入，以解决自带的类名和unocss冲突的问题
    moduleOptions: { disableVuetifyStyles: true },
  },
  imports: {
    dirs: ["./constants"],
    presets: [
      {
        from: "unocss",
        imports: [{ name: "clone", as: "cloneDeep" }, { name: "mergeDeep" }],
      },
    ],
  },
  i18n: {
    locales,
    lazy: true,
    langDir: "lang",
    strategy: "no_prefix",
    defaultLocale: "zh",
    vueI18n: "./lang/config/i18n.config.ts",
  },
  unocss: {
    presets: [presetUno()],
  },
  css: ["~/assets/vuetify/main.scss", "~/assets/markdown/markdown.scss"],
  ssr: false,
});
