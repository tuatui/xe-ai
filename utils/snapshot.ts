export const toSnapshot = async ({
  title,
  careClassNames,
  bodyClassName,
  mainClassName,
  html,
  isDark,
  lang,
}: {
  careClassNames?: string[];
  bodyClassName?: string;
  mainClassName?: string;
  title?: string;
  html?: string;
  isDark?: boolean;
  lang?: string;
}) => {
  careClassNames ??= [];
  let careCssString = "";

  // https://github.com/w3c/csswg-drafts/issues/2515
  // https://issues.chromium.org/issues/40771479
  for (const styleSheet of document.styleSheets) {
    let addFlag = false;
    for (let index = 0; index < careClassNames.length; index++) {
      const className = careClassNames[index];
      for (const rule of styleSheet.cssRules) {
        if (rule.cssText.includes(`.${className}`)) {
          careClassNames.splice(index, 1);
          addFlag = true;
          break;
        }
      }
      break;
    }

    if (addFlag)
      for (const rule of styleSheet.cssRules) careCssString += rule.cssText;

    if (careClassNames.length === 0) break;
  }

  if (isDark) {
    careCssString += `
    .v-theme--dark{
      background-color: rgb(18,18,18)
    }`;
    bodyClassName ??= "";
    bodyClassName += "v-theme--dark";
  }
  const template = `
    <!DOCTYPE html>
    <html lang="${lang || "en"}">
      <head>
        <title>${title || "Untitled"}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="Xe-AI is a website that provide AI chat server">
        <style>
          * {
            box-sizing: border-box;
          }
          button {
            background: none;
            border: none;
            cursor: pointer;
          }
          button:active {
            background: grey;
          }
          button * {
            mask: var(--un-icon) no-repeat;
          }
          ${careCssString}
          .v-application {
            display: block;
          }
        </style>
      </head>

      <body class="v-application ${bodyClassName ?? ""}">
        <main class="${mainClassName}">
          ${html}
        </main>
      </body> 
      <script>
        function cpy() {
          var str = this.parentElement.nextElementSibling.textContent;
          if (window.navigator && window.navigator.clipboard)
            navigator.clipboard.writeText(str);
          else {
            var i = document.createElement("textarea");
            document.body.appendChild(i);
            i.value = str;
            i.select();
            document.execCommand("copy");
            document.body.removeChild(i);
          }
        }
        var a = document.getElementsByTagName("button");
        for (var index = 0; index < a.length; index++) a[index].onclick = cpy;
      </script>
    </html>`;

  const blob = new Blob([template], { type: "text/html" });
  const elem = window.document.createElement("a");
  elem.href = window.URL.createObjectURL(blob);
  elem.download = title ?? "1";
  document.body.appendChild(elem);
  elem.click();
  document.body.removeChild(elem);
};
