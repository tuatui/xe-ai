import type { PartialDeep } from "type-fest";
import PrimaryLang from "./zh";

export { PrimaryLang };
export type BaseLang = PartialDeep<typeof PrimaryLang>;
