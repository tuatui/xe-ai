export const toSnapshot = ({
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
  const headChildren = document.head.children;
  for (let index = 0; index < headChildren.length; index++) {
    const styleSheet = headChildren[index];
    let addFlag = false;
    for (let _index = 0; _index < careClassNames.length; _index++) {
      const className = careClassNames[_index];
      if (styleSheet.innerHTML.includes(`.${className}`)) {
        careClassNames.splice(_index, 1);
        addFlag = true;
      }
    }
    if (addFlag) careCssString += styleSheet.innerHTML + "\n";
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
          ${careCssString}
        </style>
      </head>

      <body class="v-application ${bodyClassName ?? ""}">
        <main class="${mainClassName}">
          ${html}
        </main>
      </body>

    </html>`;
  const blob = new Blob([template], { type: "text/html" });
  const elem = window.document.createElement("a");
  elem.href = window.URL.createObjectURL(blob);
  elem.download = title ?? "1";
  document.body.appendChild(elem);
  elem.click();
  document.body.removeChild(elem);
};
