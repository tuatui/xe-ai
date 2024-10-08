import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljsCore from "highlight.js/lib/core";
import plaintext from "highlight.js/lib/languages/plaintext";
import xml from "highlight.js/lib/languages/xml";

hljsCore.registerLanguage("plaintext", plaintext);
hljsCore.registerLanguage("xml", xml); // JSX语法需要
langAliasAddition.forEach(([alias, languageName]) =>
  hljsCore.registerAliases([alias], { languageName }),
);

const marked = new Marked(
  markedHighlight({
    async: true,
    langPrefix: "hljs language-",
    async highlight(code, lang) {
      lang = lang.toLowerCase();
      if (lang && !hljsCore.getLanguage(lang)) {
        const target = langAliasMap.get(lang);
        //if (!target) console.log(`missing ${lang}`);

        if (target !== undefined) {
          const res = await import(
            `../../../node_modules/highlight.js/es/languages/${target}.js`
          );
          hljsCore.registerLanguage(target, res.default);
        }
      }
      const language = hljsCore.getLanguage(lang) ? lang : "plaintext";
      return hljsCore.highlight(code, { language }).value;
    },
  }),
);

export default (text: string) => marked.parse(text);
