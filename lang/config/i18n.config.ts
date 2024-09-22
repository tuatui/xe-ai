import * as I18nData from "vuetify/locale";
const { zhHans: zh, ...leftData } = I18nData;
const Vi18N = { zh, ...leftData };

const messages: Record<string, any> = {};

for (const [key, val] of Object.entries(Vi18N)) {
  messages[key] = {
    $vuetify: val,
  };
}

export default defineI18nConfig(() => ({
  fallbackLocale: "en",
  messages,
}));
