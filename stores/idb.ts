export const IDB_VAR = Object.freeze({
  DB_NAME: "xe_chat",
  DB_VERSION: 5,
  TOPICS: "topics",
  TOPICS_KEY: {
    UPDATE_TIME: "updateTime",
  } as const,
  CHATS: "chats",
  CHATS_KEY: {
    TOPIC_ID: "topicId",
  } as const,
  BOTS: "bots",
  DEFAULT_BOT_SETTING: "default_bot_setting",
  DEFAULT_BOT_KEY: 0,
});
import { openDB, type IDBPDatabase } from "idb";
export const useIndexedDBStore = defineStore("idb-store", () => {
  const DB = shallowRef<IDBPDatabase>();
  const isAvailable = import.meta.client;
  (async () => {
    if (!isAvailable) return;
    DB.value = await openDB(IDB_VAR.DB_NAME, IDB_VAR.DB_VERSION, {
      upgrade: (upgradeDB, _, __, transaction) => {
        if (!upgradeDB.objectStoreNames.contains(IDB_VAR.TOPICS)) {
          const store = upgradeDB.createObjectStore(IDB_VAR.TOPICS, {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex(
            IDB_VAR.TOPICS_KEY.UPDATE_TIME,
            IDB_VAR.TOPICS_KEY.UPDATE_TIME,
            {
              unique: false,
            },
          );
        } else {
          const store = transaction.objectStore(IDB_VAR.TOPICS);
          if (!store.indexNames.contains(IDB_VAR.TOPICS_KEY.UPDATE_TIME))
            store.createIndex(
              IDB_VAR.TOPICS_KEY.UPDATE_TIME,
              IDB_VAR.TOPICS_KEY.UPDATE_TIME,
              {
                unique: false,
              },
            );
        }

        if (!upgradeDB.objectStoreNames.contains(IDB_VAR.CHATS))
          upgradeDB.createObjectStore(IDB_VAR.CHATS, {
            keyPath: "id",
            autoIncrement: true,
          });

        const store = transaction.objectStore(IDB_VAR.CHATS);
        if (!store.indexNames.contains(IDB_VAR.CHATS_KEY.TOPIC_ID))
          store.createIndex(
            IDB_VAR.CHATS_KEY.TOPIC_ID,
            IDB_VAR.CHATS_KEY.TOPIC_ID,
            {
              unique: false,
            },
          );

        if (!upgradeDB.objectStoreNames.contains(IDB_VAR.BOTS))
          upgradeDB.createObjectStore(IDB_VAR.BOTS, {
            keyPath: "id",
            autoIncrement: true,
          });
        if (!upgradeDB.objectStoreNames.contains(IDB_VAR.DEFAULT_BOT_SETTING))
          upgradeDB.createObjectStore(IDB_VAR.DEFAULT_BOT_SETTING);
      },
      blocking: () => console.warn("版本有更新"),
    });
  })();
  const onDBReady = async (): Promise<IDBPDatabase<unknown>> => {
    if (DB.value) return DB.value;
    await until(() => DB.value).toBeTruthy();
    return DB.value as unknown as IDBPDatabase;
  };
  const findLast = async (storeName: string) => {
    const db = await onDBReady();
    const idbIndex = db.transaction(storeName).store;
    for await (const { value } of idbIndex.iterate(undefined, "prev"))
      return value;
  };
  return { DB, isAvailable, onDBReady, findLast };
});
