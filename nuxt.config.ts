// https://nuxt.com/docs/api/configuration/nuxt-config
import { presetUno, presetIcons } from "unocss";

export default defineNuxtConfig({
  app: {
    head: {
      title: "Xe AI",
      meta: [
        { charset: "utf-8" },
        {
          name: "description",
          content: "Xe-AI is a website that provide AI chat server",
        },
      ],
    },
  },
  build: {
    transpile: ["trpc-nuxt"],
  },
  compatibilityDate: "2024-04-03",
  // 这个功能目前还用不到
  experimental: { appManifest: false },
  devtools: { enabled: true },
  modules: [
    "@pinia/nuxt",
    "@unocss/nuxt",
    "@vueuse/nuxt",
    "vuetify-nuxt-module",
    "unplugin-icons/nuxt",
    "nuxt-auth-utils",
  ],
  vuetify: {
    // 手动控制导入，以解决自带的类名和unocss冲突的问题
    moduleOptions: { disableVuetifyStyles: true },
    vuetifyOptions: {
      icons: {
        defaultSet: "unocss-mdi",
      },
    },
  },
  imports: { dirs: ["./constants", "./types"] },
  unocss: {
    presets: [
      presetUno(),

      // 我们本可完全关闭前缀，因为原来的使用方法是mid-<icon>，
      // 这样无需进一步的改动。然而，
      // 完全关闭前缀似乎会对开发服务器产生严重的性能影响。(8s => 26s)

      // presetIcons({prefix: "") }
      presetIcons(),
    ],
  },
  css: [
    "~/assets/vuetify/main.scss",
    "~/assets/markdown/markdown.scss",
    "~/assets/math.scss",
  ],
  ssr: false,
  nitro: {
    compressPublicAssets: true,
  },
});
