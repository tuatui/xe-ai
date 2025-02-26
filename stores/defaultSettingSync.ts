const KEY = "XeAiSettingStore";
export const enum ThemeMod {
  system = 0,
  light,
  dark,
}
export interface DefaultSetting {
  isNavRail: boolean;
  useFullMDinput: boolean;
  themeMod: ThemeMod;
  enterToSend: boolean;
  /**
   * 风险功能，JS工具将可以访问到数据库数据
   * @description 这个功能只能通过控制台手动开启
   */
  allowUnsafeJsExecution: boolean;
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

  const isMobileScreen = window.innerWidth < 500;
  const mobile = ref({
    isMobileScreen, //不是响应式的
    showNav: !isMobileScreen,
  });
  if (isMobileScreen) initObj.isNavRail = false;

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

  return { setting, mobile };
});
