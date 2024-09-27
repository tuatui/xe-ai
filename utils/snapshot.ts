export const toSnapshot = ({
  title,
  careClassNames,
  bodyClassName,
  mainClassName,
  html,
}: {
  careClassNames?: string[];
  bodyClassName?: string;
  mainClassName?: string;
  title?: string;
  html?: string;
}) => {
  careClassNames ??= [];
  let careCssString = "";
  const headChildren = document.head.children;
  for (let index = 0; index < headChildren.length; index++) {
    const styleSheet = headChildren[index];
    let addFlag = false;
    for (let _index = 0; _index < careClassNames.length; _index++) {
      const className = careClassNames[_index];
      if (styleSheet.innerHTML.includes(className)) {
        careClassNames.splice(_index, 1);
        addFlag = true;
      }
    }
    if (addFlag) careCssString += styleSheet.innerHTML + "\n";
  }

  const template = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          #main {
            width: min(100%, 768px);
            margin: 0 auto;
            padding: 64px 0;
          }
          .v-theme--dark{
            background-color: rgb(18,18,18)
          }
          ${careCssString}
        </style>
      </head>

      <body class="${bodyClassName}">
        <main class="${mainClassName}" id="main">
          ${html}
        </main>
      </body>

    </html>
  `;
  const blob = new Blob([template], { type: "text/html" });
  const elem = window.document.createElement("a");
  elem.href = window.URL.createObjectURL(blob);
  elem.download = title ?? "1";
  document.body.appendChild(elem);
  elem.click();
  document.body.removeChild(elem);
};
