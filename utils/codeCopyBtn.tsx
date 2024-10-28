import { render } from "vue";

const copy = navigator.clipboard
  ? (str: string) => navigator.clipboard.writeText(str)
  : (str: string) => {
      const i = document.createElement("textarea");
      document.body.appendChild(i);
      i.value = str;
      i.select();
      document.execCommand("copy");
      document.body.removeChild(i);
    };

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
  copy(copyEl.outerText);
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
  for (const element of codeBlocks) {
    const pre = element.parentElement as HTMLPreElement;
    pre.classList.add("relative");

    render(
      <button
        class="absolute right-0 top-0 pa2 opacity-60"
        onClick={(e) => handleCopy(e, element)}
      >
        <div class="i-mdi-content-copy text-xl pointer-events-none " />
        <div class="i-mdi-check-all text-xl hidden " />
      </button>,
      pre,
    );
  }
};
