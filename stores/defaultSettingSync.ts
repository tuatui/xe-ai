const KEY = "XeAiSettingStore";

export interface DefaultSetting {
  isNavRail: boolean;
}
export const defaultSettingSync = defineStore("chat-setting-sync", () => {
  const val = localStorage.getItem(KEY);
  let initObj: undefined | Partial<DefaultSetting>;
  if (val) {
    try {
      initObj = JSON.parse(val);
    } catch (error) {
      console.error(error);
    }
  }
  initObj ??= {};

  const setting = ref<Partial<DefaultSetting>>(initObj);
  watch(
    setting,
    () => {
      try {
        const str = JSON.stringify(setting.value);
        localStorage.setItem(KEY, str);
      } catch (error) {
        console.error(error);
      }
    },
    { deep: true },
  );
  return { setting };
});
