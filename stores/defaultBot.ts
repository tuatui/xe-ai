import { chatTreeStore, LeafType, type ChatTreeOrdinary } from "./chatTree";

export interface DefaultBotSetting {
  preferBotID: number;
  preferModelName: string;
  tools?: string[];
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
    else defaultBotInfo.value = {};
  });

  const updateDefaultBotInfo = async (info: Partial<DefaultBotSetting>) => {
    const db = await iDB.onDBReady();
    try {
      const clonedData = { ...toRaw(defaultBotInfo.value), ...toRaw(info) };
      clonedData.tools = toRaw(clonedData.tools);
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
    const vt = chatTreeStore().toOrdinary();
    // 对只留有一个欢迎页情况的特殊处理，这样能避免打开欢迎页两次
    if (
      vt.children.length === 1 &&
      vt.children[0].meta?.type === LeafType.welcome
    )
      updateDefaultBotInfo({ vt: undefined });
    // 对于firefox和chrome，经过测试可以完成这个异步任务。
    else updateDefaultBotInfo({ vt });
  });

  return {
    defaultBotInfo,
    updateDefaultBotInfo,
  };
});
