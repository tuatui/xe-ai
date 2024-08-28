export const IDB_VAR = Object.freeze({
  DB_NAME: "xe_chat",
  DB_VERSION: 1,
  TOPICS: "topics",
  CHATS: "chats",
});
import { openDB, type IDBPDatabase } from "idb";
export const useIndexedDBStore = defineStore("idb-store", () => {
  const DB = ref<IDBPDatabase>();
  const isAvailable = import.meta.client;
  (async () => {
    if (!isAvailable) return;
    DB.value = await openDB(IDB_VAR.DB_NAME, IDB_VAR.DB_VERSION, {
      upgrade: (upgradeDB) => {
        upgradeDB.createObjectStore(IDB_VAR.TOPICS, {
          keyPath: "id",
          autoIncrement: true,
        });
        upgradeDB
          .createObjectStore(IDB_VAR.CHATS, {
            keyPath: "id",
            autoIncrement: true,
          })
          .createIndex("topic_id", "topic_id", { unique: false });
      },
      blocking: () => console.warn("版本有更新"),
    });
  })();
  return { DB, isAvailable };
});
