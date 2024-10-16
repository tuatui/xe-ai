import "dayjs/locale/zh";
import "dayjs/locale/en";
import "dayjs/locale/fr";
import "dayjs/locale/ru";
import "dayjs/locale/es";
import "dayjs/locale/ar";

export interface Locales {
  /**
   * 对应文件名字
   */
  code: string;
  file: string;
  name: string;
  /**
   * 语言代码
   * 格式[ISO-639]-[ISO-3166]?
   */
  languages: string[];
}
export const locales: Locales[] = [
  {
    code: "zh",
    file: "zh.ts",
    name: "中文",
    languages: ["zh-CN", "zh"],
  },
  {
    code: "en",
    file: "en.ts",
    name: "English",
    languages: ["en-US", "en"],
  },
  {
    code: "fr",
    file: "fr.ts",
    name: "Français",
    languages: ["fr"],
  },
  {
    code: "ru",
    file: "ru.ts",
    name: "Русский",
    languages: ["ru"],
  },
  {
    code: "es",
    file: "es.ts",
    name: "Español",
    languages: ["es"],
  },
  {
    code: "ar",
    file: "ar.ts",
    name: "اَلْعَرَبِيَّةُ",
    languages: ["ar"],
  },
];
