import { chatTreeStore, type ChatTreeOrdinary } from "./chatTree";

export interface DefaultBotSetting {
  preferBotID: number;
  preferModelName: string;
  doNotMemoVtOnUnload: boolean;
  useCustomVT: number;
  vt: ChatTreeOrdinary;
}

export const defaultBotStore = defineStore("default-bot", () => {
  const iDB = useIndexedDBStore();
  const getDefaultBotInfo =
    async (): Promise<Partial<DefaultBotSetting> | void> => {
      if (!iDB.isAvailable) return;
      const db = await iDB.onDBReady();
      try {
        return await db.get(
          IDB_VAR.DEFAULT_BOT_SETTING,
          IDB_VAR.DEFAULT_BOT_KEY,
        );
      } catch (error) {
        console.error(error);
      }
    };
  const defaultBotInfo = ref<Partial<DefaultBotSetting>>({});
  getDefaultBotInfo().then((info) => {
    if (info) defaultBotInfo.value = info;
  });

  const updateDefaultBotInfo = async (info: Partial<DefaultBotSetting>) => {
    const db = await iDB.onDBReady();
    try {
      const clonedData = { ...toRaw(defaultBotInfo.value), ...toRaw(info) };
      const res = await db.put(
        IDB_VAR.DEFAULT_BOT_SETTING,
        clonedData,
        IDB_VAR.DEFAULT_BOT_KEY,
      );
      defaultBotInfo.value = clonedData;
      return res;
    } catch (error) {
      console.error(error);
    }
  };

  window.addEventListener("beforeunload", () => {
    const { doNotMemoVtOnUnload: doNotMemoVT, useCustomVT } =
      defaultBotInfo.value;
    if (doNotMemoVT || useCustomVT !== undefined) return;

    // 对于firefox和chrome，经过测试可以完成这个异步任务。
    updateDefaultBotInfo({ vt: chatTreeStore().toOrdinary() });
  });

  return {
    defaultBotInfo,
    updateDefaultBotInfo,
  };
});
