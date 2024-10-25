const KEY = "XeAiSettingStore";
export const enum ThemeMod {
  system = 0,
  light,
  dark,
}
export interface DefaultSetting {
  isNavRail: boolean;
  themeMod: ThemeMod;
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
