export interface ChatData {
  id: number;
  topic_id: number;
  context: string;
  from: number;
}

export const useChats = (topicID?: MaybeRefOrGetter<number | undefined>) => {
  const tid = toRef(topicID);
  const iDB = useIndexedDBStore();
  const chats = ref<ChatData[]>([]);
  const isPending = ref(false);
  if (iDB.isAvailable)
    watch(
      tid,
      async () => {
        if (tid.value === undefined) return;
        if (!iDB.DB) await until(() => iDB.DB).toBeTruthy();
        await until(isPending).toBe(false);
        try {
          isPending.value = true;
          chats.value = await iDB.DB!.getAllFromIndex(
            IDB_VAR.CHATS,
            "topic_id",
            tid.value
          );
        } catch (error) {
          console.error(error);
        } finally {
          isPending.value = false;
        }
      },
      { immediate: true }
    );
  const updateChat = async (content: string, from: number, chatID?: number) => {
    if (tid.value === undefined) {
      console.warn("没有topic id");
      return;
    }

    await until(() => iDB.DB).toBeTruthy();
    await until(isPending).toBe(false);
    try {
      isPending.value = true;
      if (chatID === undefined)
        await iDB.DB?.add(IDB_VAR.CHATS, {
          content,
          from,
          topic_id: tid.value,
        } as Partial<ChatData>);
      else
        await iDB.DB?.put(
          IDB_VAR.CHATS,
          {
            content,
            from,
            topic_id: tid.value,
          } as Partial<ChatData>,
          chatID
        );
      chats.value =
        (await iDB.DB?.getAllFromIndex(IDB_VAR.CHATS, "topic_id", tid.value)) ??
        [];
    } catch (error) {
      console.error(error);
    } finally {
      isPending.value = false;
    }
  };
  return { chats, isPending, updateChat };
};
