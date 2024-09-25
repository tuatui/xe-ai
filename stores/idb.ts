export const IDB_VAR = Object.freeze({
  DB_NAME: "xe_chat",
  DB_VERSION: 3,
  TOPICS: "topics",
  CHATS: "chats",
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
      upgrade: (upgradeDB) => {
        if (!upgradeDB.objectStoreNames.contains(IDB_VAR.TOPICS))
          upgradeDB.createObjectStore(IDB_VAR.TOPICS, {
            keyPath: "id",
            autoIncrement: true,
          });
        if (!upgradeDB.objectStoreNames.contains(IDB_VAR.CHATS))
          upgradeDB
            .createObjectStore(IDB_VAR.CHATS, {
              keyPath: "id",
              autoIncrement: true,
            })
            .createIndex("topic_id", "topic_id", { unique: false });
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
  const onDBReady = async () => {
    await until(() => DB.value).toBeTruthy();
    return DB.value as IDBPDatabase;
  };
  return { DB, isAvailable, onDBReady };
});
