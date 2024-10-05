export interface BotsData {
  id: number;
  secretKey: string;
  nickName: string;
  provider: Provider;
  availableModel: ModelList[];
  name: string;
  apiUrl: string;
}

export const useBots = () => {
  const $client = useNuxtApp().$client;
  const iDB = useIndexedDBStore();
  const bots = ref<BotsData[]>([]);
  const getBotsData = async (id?: IDBValidKey): Promise<BotsData[]> => {
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

  const localBot2ServeBot = async (pwd: string, bot: BotsData) => {
    const res = await gcmCryptoEncrypt(pwd, bot.secretKey);
    if (!Array.isArray(bot.availableModel)) {
      bot.availableModel = [];
      console.warn("availableModel 需要是数组");
    }
    return {
      ...bot,
      iv: res.iv,
      secretKey: res.data,
    };
  };
  
  const updateBot = async (data: Partial<BotsData>) => {
    const db = await iDB.onDBReady();
    try {
      // vue的代理对象会导致序列化失败
      const clonedData = cloneDeep(data);
      clonedData.availableModel ??= [];
      const userInfo = loginStore().userInfo;

      if (data.id === undefined) {
        const res = await db.add(IDB_VAR.BOTS, clonedData);
        if (userInfo) {
          const [bot] = await getBotsData(res);
          const sBot = await localBot2ServeBot(userInfo.derivedPassword, bot);
          await $client.bot.create.mutate([sBot]);
        }
      } else {
        await db.put(IDB_VAR.BOTS, clonedData);
        if (userInfo) {
          const sBot = await localBot2ServeBot(
            userInfo.derivedPassword,
            clonedData as BotsData
          );
          await $client.bot.update.mutate(sBot);
        }
      }
      bots.value = await getBotsData();
    } catch (error) {
      console.error(error);
      console.warn("数据更新失败", data);
    }
  };

  const diffServerAndLocalBot = async (pwd: string) => {
    const [serverSideBots, localSideBots] = await Promise.all([
      $client.bot.getAll.query(),
      getBotsData(),
    ]);

    type ServerSideBot = (typeof serverSideBots)[0];
    const serveSideBotIdMap = new Map<number, ServerSideBot>();
    const localSideBotIdMap = new Map<number, BotsData>();

    serverSideBots.forEach((each) => serveSideBotIdMap.set(each.localId, each));
    localSideBots.forEach((each) => localSideBotIdMap.set(each.id, each));

    const serveSideBotIdSet = new Set<number>(serveSideBotIdMap.keys());
    const localSideBotIdSet = new Set<number>(localSideBotIdMap.keys());

    const needDecrypt = serveSideBotIdSet.difference(localSideBotIdSet);
    const needUpload = localSideBotIdSet.difference(serveSideBotIdSet);

    await Promise.all([
      Promise.all(
        needDecrypt.values().map(async (value) => {
          const bot = serveSideBotIdMap.get(value)!;
          const secretKey = await gcmCryptoDecrypt({
            key: pwd,
            data: bot.secretKey,
            iv: bot.iv,
          });
          bot.secretKey = secretKey;

          await updateBot({ ...bot, id: bot.localId });
        })
      ),
      (async () => {
        const bots = await Promise.all(
          needUpload.values().map(async (value) => {
            const bot = localSideBotIdMap.get(value)!;
            return await localBot2ServeBot(pwd, bot);
          })
        );
        await $client.bot.create.mutate(bots);
      })(),
    ]);
  };
  return { bots, updateBot, getBotsData, diffServerAndLocalBot };
};
