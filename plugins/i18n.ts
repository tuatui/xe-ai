import { I18nManager } from "~/lang/core/main";

export default defineNuxtPlugin(() => {
  const im = new I18nManager();

  const L = toReactive(im.L);
  return { provide: { L, i18n: im } };
});
