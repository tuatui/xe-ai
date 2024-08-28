interface TopicData {
  id: number;
  title: string;
}

export const useTopics = () => {
  const iDB = useIndexedDBStore();
  const topics = ref<TopicData[]>([]);
  const isPending = ref(false);
  if (iDB.isAvailable)
    watchEffect(async () => {
      if (!iDB.DB) return;

      isPending.value = true;
      topics.value = await iDB.DB.getAll(IDB_VAR.TOPICS);
      isPending.value = false;
    });
  const updateTopic = async (title: string, topicID?: number) => {
    await until(() => iDB.DB).toBeTruthy();
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
  };
  return { topics, isPending, updateTopic };
};
