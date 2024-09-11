// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: [
    "@pinia/nuxt",
    "@unocss/nuxt",
    "@vueuse/nuxt",
    "vuetify-nuxt-module",
  ],
  vuetify: {
    // 手动控制导入，以解决自带的类名和unocss冲突的问题
    moduleOptions: { disableVuetifyStyles: true },
  },
  css: ["~/assets/vuetify/main.scss", "github-markdown-css"],
  ssr: false,
});
