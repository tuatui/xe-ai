import type { MarkedExtension, Tokens } from "marked";

type AsyncHighlightFunction = (
  code: string,
  language: string,
  info: string,
) => Promise<string>;
const titleHtml = (lang: string) =>
  `<strong>${lang}</strong><button><div class="i-mdi-content-copy"></div></button>`;
export const markedHighlight = ({
  highlight,
}: {
  highlight: AsyncHighlightFunction;
}): MarkedExtension => {
  return {
    async: true,
    walkTokens(token) {
      if (token.type !== "code") return;

      return Promise.resolve(
        highlight(token.text, getLang(token.lang), token.lang || ""),
      ).then(updateToken(token as Tokens.Code));
    },
    renderer: {
      code({ escaped, text: code, lang: infoString = "" }) {
        const lang = getLang(infoString);
        code = code.replace(/\n$/, "");
        return `<pre class="hl-code-wrapper">${titleHtml(
          lang,
        )}<code class="hljs language-${escape(lang)}">${
          escaped ? code : escape(code, true)
        }\n</code></pre>`;
      },
    },
  };
};

function getLang(lang: string) {
  return lang.match(/\S*/)?.[0] ?? "";
}

function updateToken(token: Tokens.Code) {
  return (code: string) => {
    if (typeof code === "string" && code !== token.text) {
      token.escaped = true;
      token.text = code;
    }
  };
}

// copied from marked helpers
const escapeTest = /[&<>"']/;
const escapeReplace = new RegExp(escapeTest.source, "g");
const escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
const escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, "g");
const escapeReplacements = new Map([
  ["&", "&amp;"],
  ["<", "&lt;"],
  [">", "&gt;"],
  ['"', "&quot;"],
  ["'", "&#39;"],
]);

const getEscapeReplacement = (ch: string) => escapeReplacements.get(ch) ?? "";
function escape(html: string, encode?: boolean) {
  if (encode) {
    if (escapeTest.test(html)) {
      return html.replace(escapeReplace, getEscapeReplacement);
    }
  } else {
    if (escapeTestNoEncode.test(html)) {
      return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
    }
  }

  return html;
}
