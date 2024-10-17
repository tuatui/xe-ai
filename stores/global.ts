export const globalStore = defineStore("global-store", () => {
  const map = markRaw(new Map<string, any>());
  return { map };
});
