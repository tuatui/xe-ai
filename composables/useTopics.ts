export interface TopicData {
  id: number;
  title: string;
}

export const useTopics = () => {
  const iDB = useIndexedDBStore();
  const topics = ref<TopicData[]>([]);
  const isPending = ref(false);
  if (iDB.isAvailable)
    (async () => {
      if (!iDB.DB) await until(() => iDB.DB).toBeTruthy();
      await until(isPending).toBe(false);
      try {
        isPending.value = true;
        topics.value = await iDB.DB!.getAll(IDB_VAR.TOPICS);
      } catch (error) {
        console.error(error);
      } finally {
        isPending.value = false;
      }
    })();
  const updateTopic = async (title: string, topicID?: number) => {
    await until(() => iDB.DB).toBeTruthy();
    await until(isPending).toBe(false);
    try {
      isPending.value = true;
      if (topicID === undefined)
        await iDB.DB?.add(IDB_VAR.TOPICS, {
          title,
        } as Partial<TopicData>);
      else
        await iDB.DB?.put(
          IDB_VAR.TOPICS,
          {
            title,
          } as Partial<TopicData>,
          topicID
        );
      topics.value = (await iDB.DB?.getAll(IDB_VAR.TOPICS)) ?? [];
    } catch (error) {
      console.error(error);
    } finally {
      isPending.value = false;
    }
  };
  return { topics, isPending, updateTopic };
};
