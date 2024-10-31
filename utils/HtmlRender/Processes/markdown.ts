import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljsCore from "highlight.js";
import { hljsDefineVue } from "./hljs-vue";

for (const [alias, languageName] of langAliasAddition.entries()) {
  hljsCore.registerAliases([alias], { languageName });
}

hljsCore.registerLanguage("vue", hljsDefineVue);

const marked = new Marked(
  markedHighlight({
    async: true,
    langPrefix: "hljs language-",
    async highlight(code, lang) {
      lang = lang.toLowerCase();

      const language = hljsCore.getLanguage(lang) ? lang : "plaintext";
      return hljsCore.highlight(code, { language }).value;
    },
  }),
);

export default (text: string) => marked.parse(text);
