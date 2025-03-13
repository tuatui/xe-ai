import { render } from "vue";

const handleCopy = async (el: MouseEvent, copyEl: HTMLElement) => {
  const target = el.target as HTMLDivElement;
  const timeout = 3000;
  if (!target) return;
  const first = target.firstElementChild;
  const last = target.lastElementChild;
  first?.classList.toggle("hidden");
  last?.classList.toggle("hidden");
  target?.classList.toggle("pointer-events-none");
  notificationStore().pushNotification({
    content: useNuxtApp().$L.tips.copySuccess,
    timeout: timeout,
  });
  copy2Clipboard(copyEl.outerText);
  await new Promise<void>((resolve) => setTimeout(resolve, timeout));

  first?.classList.toggle("hidden");
  last?.classList.toggle("hidden");
  target?.classList.toggle("pointer-events-none");
};

export const createCodeCopyBtn = (el: HTMLElement) => {
  const codeBlocks = el.querySelectorAll(
    "pre>code",
  ) as NodeListOf<HTMLDivElement>;

  if (codeBlocks.length === 0) return;
  const title = useNuxtApp().$L.common.copy;
  for (const element of codeBlocks) {
    const pre = element.parentElement as HTMLPreElement;

    const temp = document.createElement("template");
    render(
      <div class="text-right h0">
        <button
          class="pa2 text-medium-emphasis"
          onClick={(e) => handleCopy(e, element)}
          title={title}
        >
          <div class="i-mdi-content-copy text-xl pointer-events-none " />
          <div class="i-mdi-check-all text-xl hidden " />
        </button>
      </div>,
      temp,
    );
    pre.parentElement?.insertBefore(temp.firstChild!, pre);
  }
};
