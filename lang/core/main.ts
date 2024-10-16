import type { ShallowRef } from "vue";
import { PrimaryLang } from "../primary";
import { locales } from "./conf";
import { deepMerge } from "@antfu/utils";

export class I18nManager {
  L = shallowRef(deepMerge({}, PrimaryLang)) as ShallowRef<typeof PrimaryLang>;
  locale;
  constructor() {
    this.locale = ref(locales[0]);
    document.documentElement.lang = this.locale.value.language;
  }

  setLang = async (lang: string) => {
    if (lang === locales[0].code) {
      deepMerge(this.L.value, PrimaryLang);
      triggerRef(this.L);
      this.locale.value = locales[0];
      document.documentElement.lang = this.locale.value.language;
      return;
    }
    const locale = locales.find(({ code }) => code === lang);
    if (!locale)
      throw new Error(
        `Language code "${lang}" not found, did you register it in "./conf/ts" ? `,
      );

    const { default: d } = await import(`../${lang}.ts`);

    deepMerge(this.L.value, PrimaryLang, d);
    triggerRef(this.L);

    this.locale.value = locale;
    document.documentElement.lang = locale.language;
  };
}
