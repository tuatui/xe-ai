export interface ChatData {
  id: number;
  topic_id: number;
  context: string;
  HtmlContextCache?: string;
  from: ChatRole;
}

export enum ChatRole {
  system,
  user,
  assistant,
}

export type useChatReturn = Ref<{
  chats: ChatData[];
  isPending: boolean;
  updateChat: (
    context: string,
    from?: number,
    id?: IDBValidKey
  ) => Promise<IDBValidKey | void>;
  chatRefCount: number;
}>;

export const useChats = (topicID: number): useChatReturn => {
  const iDB = useIndexedDBStore();
  const chats = ref<ChatData[]>([]);

  const taskCount = ref(0);
  const isPending = computed(() => taskCount.value > 0);

  const getChatsData = async (): Promise<ChatData[]> => {
    if (!iDB.isAvailable) return [];
    const db = await iDB.onDBReady();
    try {
      return await db.getAllFromIndex(IDB_VAR.CHATS, "topic_id", topicID);
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  taskCount.value++;
  getChatsData().then((val) => {
    chats.value = val;
    taskCount.value--;
  });

  const updateChat = async (
    context: string,
    from?: number,
    id?: IDBValidKey
  ) => {
    const db = await iDB.onDBReady();

    try {
      taskCount.value++;
      let key;
      if (id === undefined)
        key = await db.add(IDB_VAR.CHATS, {
          context,
          from,
          topic_id: topicID,
        } as Partial<ChatData>);
      else
        key = await db.put(IDB_VAR.CHATS, {
          id,
          context,
          from,
          topic_id: topicID,
        } as Partial<ChatData>);
      chats.value = await getChatsData();
      return key;
    } catch (error) {
      console.error(error);
    } finally {
      taskCount.value--;
    }
  };
  const chatRefCount = ref(0);
  return ref({ chats, isPending, updateChat, chatRefCount });
};
