import type { ChatInterface, ChatCreationData, ChatData } from "./type";

export class ChatLocal implements ChatInterface {
  constructor(private iDB = useIndexedDBStore()) {}
  get = async (id: number) => {
    const db = await this.iDB.onDBReady();
    try {
      return await db.getAllFromIndex(IDB_VAR.CHATS, "topic_id", id);
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  update = async (data: ChatCreationData) => {
    const db = await this.iDB.onDBReady();

    let id: IDBValidKey | undefined = data.id;
    try {
      if (data.id === undefined)
        id = await db.add(IDB_VAR.CHATS, cloneDeep(data));
      else {
        const oldVal = (await db.get(IDB_VAR.CHATS, data.id)) as ChatData;
        const mergedVal = mergeDeep(oldVal, data);
        await db.put(IDB_VAR.CHATS, mergedVal);
      }
    } catch (error) {
      console.log(error);
    } finally {
      return id as number;
    }
  };
}
