import { Marked } from "marked";
import { markedHighlight } from "./highlight";
import hljsCore from "highlight.js/lib/core";
import { hljsDefineVue } from "./hljs-vue";
import type { ProcessCtx } from "~/utils";
for (const [alias, languageName] of langAliasAddition.entries()) {
  hljsCore.registerAliases([alias], { languageName });
}

// 注册常用的代码块platintext以减少请求
hljsCore.registerLanguage("plaintext", () => ({
  name: "Plain text",
  aliases: ["text", "txt"],
  disableAutodetect: true,
  contains: [],
}));

export const hljs = hljsCore;

// 😅
const langPack = ["xml", "javascript", "typescript", "css", "scss"];
let isLangPackInstalled = false;

const analyzeAndImport = async (lang: string) => {
  if (hljsCore.getLanguage(lang)) return;
  const target = langAliasMap.get(lang);
  if (target !== undefined) {
    const res = await import(
      `../../../node_modules/highlight.js/es/languages/${target}.js`
    );
    hljsCore.registerLanguage(target, res.default);
    if (!isLangPackInstalled) {
      const res = await Promise.all(
        langPack.map(
          (lang) =>
            import(
              `../../../node_modules/highlight.js/es/languages/${lang}.js`
            ),
        ),
      );
      if (!isLangPackInstalled) {
        langPack.forEach((each, i) =>
          hljsCore.registerLanguage(each, res[i].default),
        );
        hljsCore.registerLanguage("vue", hljsDefineVue);
      }
      isLangPackInstalled = true;
    }
  }
};
const marked = new Marked(
  markedHighlight({
    async highlight(code, lang) {
      lang = lang.toLowerCase();
      analyzeAndImport(lang);
      const language = hljsCore.getLanguage(lang) ? lang : "plaintext";
      return hljsCore.highlight(code, { language }).value;
    },
  }),
);

const markedWithFullCode = new Marked(
  markedHighlight({
    async highlight(code, lang) {
      lang = lang.toLowerCase();
      await analyzeAndImport(lang);
      const language = hljsCore.getLanguage(lang) ? lang : "plaintext";
      return hljsCore.highlight(code, { language }).value;
    },
  }),
);

export default async (ctx: ProcessCtx): Promise<ProcessCtx> => {
  if (ctx.shouldFullRender) ctx.text = await markedWithFullCode.parse(ctx.text);
  else {
    ctx.text = await marked.parse(ctx.text);
    ctx.isMDPartialRender = true;
  }
  return ctx;
};
