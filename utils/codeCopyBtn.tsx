const handleCopyEl = async (el: MouseEvent, copyEl: HTMLElement) => {
  const target = el.target as HTMLDivElement;
  const timeout = 3000;
  if (!target) return;

  target.firstElementChild?.classList.remove("i-mdi-content-copy");
  target.firstElementChild?.classList.add("i-mdi-check-all");
  target.classList.toggle("pointer-events-none");
  notificationStore().pushNotification({
    content: useNuxtApp().$L.tips.copySuccess,
    timeout: timeout,
  });
  copy2Clipboard(copyEl.outerText);
  await new Promise<void>((resolve) => setTimeout(resolve, timeout));

  target.firstElementChild?.classList.add("i-mdi-content-copy");
  target.firstElementChild?.classList.remove("i-mdi-check-all");
  target.classList.toggle("pointer-events-none");
};

const handleCopy = (ev: MouseEvent) => {
  const cpyEl = (ev.target as HTMLButtonElement)?.nextElementSibling;
  if (!cpyEl) return;
  handleCopyEl(ev, cpyEl as HTMLDivElement);
};

export const createCodeCopyBtn = (el: HTMLElement, { title = "" } = {}) => {
  const cpyBtn = el.querySelectorAll(
    "pre>button",
  ) as NodeListOf<HTMLDivElement>;

  if (cpyBtn.length === 0) return;
  for (const element of cpyBtn) {
    element.addEventListener("click", handleCopy);
    if (element.title !== title) element.title = title;
  }
};
