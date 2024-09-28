export const scrollToEnd = (el: HTMLElement, options?: ScrollToOptions) => {
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 10) return;
  el.scrollTo({ top: el.scrollHeight, behavior: "smooth", ...options });
};
