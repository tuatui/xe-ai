export interface DefalutBotSetting {
  preferBotID: number;
  preferModelName: string;
}
export const defalutBotStore = defineStore("default-bot", () => {
  const iDB = useIndexedDBStore();
  const getDefaultBotInfo =
    async (): Promise<Partial<DefalutBotSetting> | void> => {
      if (!iDB.isAvailable) return;
      const db = await iDB.onDBReady();
      try {
        return await db.get(
          IDB_VAR.DEFALUT_BOT_SETTING,
          IDB_VAR.DEFALUT_BOT_KEY
        );
      } catch (error) {
        console.error(error);
      }
    };
  const defalutBotInfo = ref<Partial<DefalutBotSetting>>({});
  getDefaultBotInfo().then((info) => {
    if (info) defalutBotInfo.value = info;
  });
  
  const updateDeaflutBotInfo = async (info: Partial<DefalutBotSetting>) => {
    const db = await iDB.onDBReady();
    try {
      const clonedData = cloneDeep(info);
      const res = await db.put(
        IDB_VAR.DEFALUT_BOT_SETTING,
        clonedData,
        IDB_VAR.DEFALUT_BOT_KEY
      );
      defalutBotInfo.value = info;
      return res;
    } catch (error) {
      console.error(error);
    }
  };
  return { defalutBotInfo, updateDeaflutBotInfo };
});
