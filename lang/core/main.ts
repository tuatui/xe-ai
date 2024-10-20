import { PrimaryLang } from "../primary";
import { locales, type Locales } from "./conf";
import { deepMerge } from "@antfu/utils";

const LocalStoreKey = "XeAi-i18nUserSelectLanguages";
const LocalStoreDivider = ",";

export class I18nManager {
  public L = shallowRef(deepMerge({}, PrimaryLang) as typeof PrimaryLang);
  public locale;

  private readonly primaryLocales = locales[0];

  constructor() {
    this.locale = ref(this.primaryLocales);

    const userLangs = navigator.languages?.slice(0) ?? [navigator.language];

    const storeLang = localStorage.getItem(LocalStoreKey);
    if (storeLang) userLangs.unshift(...storeLang.split(LocalStoreDivider));

    // 精确匹配
    const exactMatch = this.findFitLocal(
      userLangs,
      locales,
      (a: string, b: string) => a === b,
    );
    if (exactMatch) {
      if (exactMatch === this.primaryLocales) this.setPrimaryLocal();
      else this.setLang(exactMatch.code, false);
      return;
    }
    // 模糊匹配
    const fuzMatch = this.findFitLocal(
      userLangs,
      locales,
      (supportLang: string, userLang: string) => {
        const index = supportLang.indexOf("-");
        if (index < 0) return userLang.startsWith(supportLang);
        else return userLang.startsWith(supportLang.slice(0, index));
      },
    );
    if (fuzMatch) {
      if (fuzMatch === this.primaryLocales) this.setPrimaryLocal();
      else this.setLang(fuzMatch.code, false);
      return;
    }
    this.setPrimaryLocal();
  }
  private setPrimaryLocal = () => {
    document.documentElement.lang = this.primaryLocales.languages.shift() ?? "";
  };
  private findFitLocal = (
    userLangs: readonly string[],
    locales: readonly Locales[],
    match: (supportLang: string, userLang: string) => boolean,
  ) => {
    for (let index = 0; index < userLangs.length; index++) {
      const _locales = locales.slice();
      const currLang = userLangs[index];
      for (let allLocalesIndex = 0; _locales.length > 0; allLocalesIndex++) {
        for (
          let localesIndex = 0;
          localesIndex < _locales.length;
          localesIndex++
        ) {
          const { languages } = _locales[localesIndex];
          if (languages.length <= allLocalesIndex) {
            _locales.splice(localesIndex, 1);
            continue;
          } else if (!match(languages[allLocalesIndex], currLang)) continue;

          return _locales[localesIndex];
        }
      }
    }
  };
  private setHtmlLangTag = (lang: string[]) => {
    document.documentElement.lang = lang.slice(0, 1).pop() ?? "";
  };

  public setLang = async (lang: string, memo = true) => {
    if (lang === this.primaryLocales.code) {
      deepMerge(this.L.value, PrimaryLang);
      triggerRef(this.L);
      this.locale.value = this.primaryLocales;
      this.setHtmlLangTag(this.locale.value.languages);
    } else {
      const locale = locales.find(({ code }) => code === lang);
      if (!locale)
        throw new Error(
          `Language code "${lang}" not found, did you register it in "./conf/ts" ? `,
        );

      const { default: d } = await import(`../${lang}.ts`);

      deepMerge(this.L.value, PrimaryLang, d);
      triggerRef(this.L);

      this.locale.value = locale;
      this.setHtmlLangTag(locale.languages);
    }

    if (memo)
      localStorage.setItem(
        LocalStoreKey,
        this.locale.value.languages.join(LocalStoreDivider),
      );
  };
}
