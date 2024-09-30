export interface BotsData {
  id: number;
  secret_key: string;
  nick_name: string;
  provider: Provider;
  availableModel: ModelList[];
  name: string;
  apiUrl: string;
}

export const useBots = () => {
  const iDB = useIndexedDBStore();
  const bots = ref<BotsData[]>([]);
  const getBotsData = async (id?: number): Promise<BotsData[]> => {
    if (!iDB.isAvailable) return [];
    const db = await iDB.onDBReady();
    try {
      if (id === undefined) return await db.getAll(IDB_VAR.BOTS);
      else return [await db.get(IDB_VAR.BOTS, id)];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  getBotsData().then((val) => (bots.value = val));

  const updateBot = async (data: Partial<BotsData>) => {
    const db = await iDB.onDBReady();
    try {
      // vue的代理对象会导致序列化失败
      // 我不知道为什么unocss会有个clone函数，但是看起来可以实现深拷贝
      const clonedData = cloneDeep(data);
      if (data.id === undefined) await db.add(IDB_VAR.BOTS, clonedData);
      else await db.put(IDB_VAR.BOTS, clonedData);
      bots.value = await getBotsData();
    } catch (error) {
      console.error(error);
      console.warn("数据更新失败", data);
    }
  };
  return { bots, updateBot, getBotsData };
};
