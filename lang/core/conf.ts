import "dayjs/locale/zh";
import "dayjs/locale/en";
import "dayjs/locale/fr";
import "dayjs/locale/ru";
import "dayjs/locale/es";
import "dayjs/locale/ar";

export interface Locales {
  code: string;
  file: string;
  name: string;
  /**
   * ISO-639 语言代码
   */
  language: string;
}
export const locales: Locales[] = [
  {
    code: "zh",
    file: "zh.ts",
    name: "中文",
    language: "zh",
  },
  {
    code: "en",
    file: "en.ts",
    name: "English",
    language: "en",
  },
  {
    code: "fr",
    file: "fr.ts",
    name: "Français",
    language: "fr",
  },
  {
    code: "ru",
    file: "ru.ts",
    name: "Русский",
    language: "ru",
  },
  {
    code: "es",
    file: "es.ts",
    name: "Español",
    language: "es",
  },
  {
    code: "ar",
    file: "ar.ts",
    name: "اَلْعَرَبِيَّةُ",
    language: "ar",
  },
];
