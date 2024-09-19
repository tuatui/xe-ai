export interface TopicData {
  id: number;
  title: string;
  prederSetting?: DefalutBotSetting;
}
export const topicStore = defineStore("topic-store", () => {
  const iDB = useIndexedDBStore();
  const topics = ref<TopicData[]>([]);
  const taskCount = ref(0);
  const isPending = computed(() => taskCount.value > 0);
  const getTopicData = async (id?: number): Promise<TopicData[]> => {
    let res: TopicData[] = [];
    try {
      taskCount.value++;
      const db = await iDB.onDBReady();
      if (id === undefined) res = await db.getAll(IDB_VAR.TOPICS);
      else res = [await db.get(IDB_VAR.TOPICS, id)];
    } catch (error) {
      console.error(error);
    } finally {
      taskCount.value--;
      return res;
    }
  };
  getTopicData().then((v) => (topics.value = v));

  const removeTopic = async (topicID: number) => {
    const idb = await iDB.onDBReady();
    await idb.delete(IDB_VAR.TOPICS, topicID);
    topics.value = await idb.getAll(IDB_VAR.TOPICS);
  };
  const updateTopic = async (title: string, topicID?: number) => {
    let res: IDBValidKey | undefined;
    try {
      taskCount.value++;
      const db = await iDB.onDBReady();
      if (topicID === undefined)
        res = await db.add(IDB_VAR.TOPICS, {
          title,
        } as Partial<TopicData>);
      else
        res = await db.put(IDB_VAR.TOPICS, {
          id: topicID,
          title,
        });
      topics.value = await db.getAll(IDB_VAR.TOPICS);
    } catch (error) {
      console.error(error);
    } finally {
      taskCount.value--;
      return res;
    }
  };
  const updateTopic2 = async (
    topicData?: Partial<TopicData>,
    topicID?: number
  ) => {
    let res: IDBValidKey | undefined;
    const clonedData = cloneDeep(topicData);
    try {
      taskCount.value++;
      const db = await iDB.onDBReady();
      if (topicID === undefined) res = await db.add(IDB_VAR.TOPICS, clonedData);
      else res = await db.put(IDB_VAR.TOPICS, { id: topicID, ...clonedData });
      topics.value = await db.getAll(IDB_VAR.TOPICS);
    } catch (error) {
      console.error(error);
    } finally {
      taskCount.value--;
      return res;
    }
  };
  return {
    topics,
    isPending,
    updateTopic,
    updateTopic2,
    removeTopic,
    getTopicData,
  };
});
