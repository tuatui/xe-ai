export interface BotsData {
  id: number;
  secretKey: string;
  nickName: string;
  provider: Provider;
  availableModel: ModelList[];
  primaryModel: string | undefined | null;
  memoCount: number | undefined;
  name: string;
  apiUrl: string;
  createTime: Date;
}
export type BotCreationData = Omit<BotsData, "id"> &
  Pick<Partial<BotsData>, "id">;

export const botsStore = defineStore("bots-store", () => {
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
  const lastBot = async (): Promise<BotsData | undefined> =>
    iDB.findLast(IDB_VAR.BOTS);

  const localBot2ServeBot = async <
    T extends {
      secretKey: string;
      createTime: Date;
    },
  >(
    pwd: string,
    bot: T,
  ) => {
    const res = await gcmCryptoEncrypt(pwd, bot.secretKey);
    return {
      ...bot,
      iv: res.iv,
      secretKey: res.data,
      createTime: bot.createTime.toJSON(),
    };
  };
  const updateBotNotSync = async (data: Partial<BotsData>) => {
    try {
      const db = await iDB.onDBReady();
      const rawData = toRaw(data);
      if (rawData.availableModel)
        rawData.availableModel = rawData.availableModel.map((each) =>
          toRaw(each),
        );
      else rawData.availableModel = [];
      let res: IDBValidKey;
      if (data.id === undefined) {
        rawData.createTime ??= new Date();
        res = await db.add(IDB_VAR.BOTS, rawData);
        rawData.id = res as number;
        bots.value.push(rawData as BotsData);
      } else {
        res = await db.put(IDB_VAR.BOTS, rawData);
        const bot = bots.value.find((i) => i.id === res);
        if (bot) Object.assign(bot, rawData);
      }
      return res;
    } catch (error) {
      console.error(error);
      console.warn("IDB数据更新失败", data);
    }
  };
  const updateBot = async (
    data: BotCreationData,
  ): Promise<IDBValidKey | void> => {
    const userInfo = loginStore().userInfo;
    if (!userInfo) {
      const id = await updateBotNotSync(data);
      return id;
    } else {
      if (data.id === undefined) {
        const sBot = await localBot2ServeBot(userInfo.derivedPassword, data);
        const res = await $client.bot.create.mutate(sBot);
        const id = await updateBotNotSync({
          ...data,
          id: res.localId,
        });
        return id;
      } else {
        const id = await updateBotNotSync(data);
        const sBot = await localBot2ServeBot(
          userInfo.derivedPassword,
          data as BotsData,
        );
        await $client.bot.update.mutate(sBot);
        return id;
      }
    }
  };
  const deleteBotNotSync = async (id: IDBValidKey, autoUpdate = true) => {
    const db = await iDB.onDBReady();
    try {
      await db.delete(IDB_VAR.BOTS, id);
      if (!autoUpdate) return;

      const index = bots.value.findIndex((bot) => bot.id == id);
      if (index >= 0) bots.value.splice(index, 1);
    } catch (error) {
      console.error(error);
      console.warn("数据更新失败");
    }
  };
  const deleteBot = async (id: number) => {
    const userInfo = loginStore().userInfo;
    if (!userInfo) {
      await deleteBotNotSync(id);
      return;
    } else {
      await $client.bot.delete.mutate(id);
      await deleteBotNotSync(id);
    }
  };
  const diffServerAndLocalBot = async (pwd: string) => {
    const [
      {
        bots: serverSideBots,
        info: { localBotsLen },
      },
      localSideBots,
    ] = await Promise.all([$client.bot.getAll.query(), getBotsData()]);

    type ServerSideBot = (typeof serverSideBots)[0];
    const serveSideBotIdMap = new Map<number, ServerSideBot>();
    const localSideBotIdMap = new Map<number, BotsData>();

    serverSideBots.forEach((each) => serveSideBotIdMap.set(each.localId, each));
    localSideBots.forEach((each) => localSideBotIdMap.set(each.id, each));

    const serveSideBotIdSet = new Set<number>(serveSideBotIdMap.keys());
    const localSideBotIdSet = new Set<number>(localSideBotIdMap.keys());

    const needDecrypt = serveSideBotIdSet.difference(localSideBotIdSet);
    const needUpload = localSideBotIdSet.difference(serveSideBotIdSet);
    const needCheck = localSideBotIdSet.intersection(serveSideBotIdSet);

    await Promise.all(
      (() => {
        if (needCheck.size === 0) return [];
        let idCursor = localBotsLen;
        return needCheck
          .values()
          .filter((value) => {
            const sBot = serveSideBotIdMap.get(value);
            const lBot = localSideBotIdMap.get(value);
            if (!sBot || !lBot) return false;
            // 已同步的信息，就不动他
            return sBot.createTime !== lBot.createTime.toJSON();
          })
          .map(async (value) => {
            const lBot = localSideBotIdMap.get(value)!;
            const newId = ++idCursor;
            await deleteBotNotSync(value);
            lBot.id = newId;
            await updateBotNotSync(lBot);
            localSideBotIdMap.set(newId, lBot);
            needUpload.add(newId);
            needDecrypt.add(value);
          });
      })(),
    );
    await Promise.all([
      Promise.all(
        needDecrypt.values().map(async (value) => {
          const bot = serveSideBotIdMap.get(value)!;
          try {
            await gcmCryptoDecrypt({
              key: pwd,
              data: bot.secretKey,
              iv: bot.iv,
            });
          } catch (error) {
            console.error("Decrypt Error", {
              error,
              ...loginStore(),
              bot,
              input: {
                key: pwd,
                data: bot.secretKey,
                iv: bot.iv,
              },
            });
          }
          const secretKey = await gcmCryptoDecrypt({
            key: pwd,
            data: bot.secretKey,
            iv: bot.iv,
          });
          bot.secretKey = secretKey;

          await updateBotNotSync({
            ...bot,
            memoCount: bot.memoCount ?? undefined,
            id: bot.localId,
            createTime: new Date(bot.createTime),
          });
        }),
      ),
      (async () => {
        const bots = await Promise.all(
          needUpload.values().map(async (value) => {
            const bot = localSideBotIdMap.get(value)!;
            return await localBot2ServeBot(pwd, bot);
          }),
        );
        await $client.bot.sync.mutate(bots);
      })(),
    ]);
  };
  return {
    bots,
    updateBot,
    getBotsData,
    diffServerAndLocalBot,
    lastBot,
    deleteBot,
  };
});
