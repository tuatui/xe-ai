export const scrollToEnd = (el: HTMLElement, options?: ScrollToOptions) =>
  el.scrollTo({ top: el.scrollHeight, behavior: "smooth", ...options });
