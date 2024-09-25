export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
import en from "~/lang/en"
export type I18nLang = DeepPartial<typeof en>;
