import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljsCore from "highlight.js/lib/core";

langAliasAddition
  .entries()
  .forEach(([alias, languageName]) =>
    hljsCore.registerAliases([alias], { languageName }),
  );
const analyzeAndImport = async (lang: string) => {
  const target = langAliasMap.get(lang);
  if (target !== undefined) {
    const res = await import(
      `../../../node_modules/highlight.js/es/languages/${target}.js`
    );
    hljsCore.registerLanguage(target, res.default);
    // JSX语法依赖于XML解析器
    if (target === "typescript" || target === "javascript") {
      const res = await import(`highlight.js/lib/languages/xml`);
      hljsCore.registerLanguage("xml", res.default);
    }
  } else if (!hljsCore.getLanguage("plaintext")) {
    const res = await import(`highlight.js/lib/languages/plaintext`);
    hljsCore.registerLanguage("plaintext", res.default);
  }
};
const marked = new Marked(
  markedHighlight({
    async: true,
    langPrefix: "hljs language-",
    async highlight(code, lang) {
      await analyzeAndImport(lang);
      const language = hljsCore.getLanguage(lang) ? lang : "plaintext";
      return hljsCore.highlight(code, { language }).value;
    },
  }),
);

export default (text: string) => marked.parse(text);
