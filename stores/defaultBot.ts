export interface DefaultBotSetting {
  preferBotID: number;
  preferModelName: string;
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
          IDB_VAR.DEFAULT_BOT_KEY
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
      const clonedData = cloneDeep(info);
      const res = await db.put(
        IDB_VAR.DEFAULT_BOT_SETTING,
        clonedData,
        IDB_VAR.DEFAULT_BOT_KEY
      );
      defaultBotInfo.value = info;
      return res;
    } catch (error) {
      console.error(error);
    }
  };
  return { defaultBotInfo: defaultBotInfo, updateDefaultBotInfo: updateDefaultBotInfo };
});
