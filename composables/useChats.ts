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
  bot,
}

export type useChatReturn = Ref<{
  chats: ChatData[];
  isPending: boolean;
  updateChat: (context: string, from: number, chatID?: number) => Promise<void>;
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

  const updateChat = async (context: string, from: number, chatID?: number) => {
    const db = await iDB.onDBReady();

    try {
      taskCount.value++;
      if (chatID === undefined)
        await db.add(IDB_VAR.CHATS, {
          context,
          from,
          topic_id: topicID,
        } as Partial<ChatData>);
      else
        await db.put(
          IDB_VAR.CHATS,
          {
            context,
            from,
            topic_id: topicID,
          } as Partial<ChatData>,
          chatID
        );
      chats.value = await getChatsData();
    } catch (error) {
      console.error(error);
    } finally {
      taskCount.value--;
    }
  };
  const chatRefCount = ref(0);
  return ref({ chats, isPending, updateChat, chatRefCount });
};
