// 便于编译器树摇优化，
import { zhHans as zh, en, fr, ru, es, ar } from "vuetify/locale";
const Vi18N = { zh, en, fr, ru, es, ar };
const messages: Record<string, any> = {};
for (const [key, val] of Object.entries(Vi18N)) {
  messages[key] = {
    $vuetify: val,
  };
}

import "dayjs/locale/zh";
import "dayjs/locale/en";
import "dayjs/locale/fr";
import "dayjs/locale/ru";
import "dayjs/locale/es";
import "dayjs/locale/ar";

export default defineI18nConfig(() => ({
  fallbackLocale: "en",
  messages,
}));
