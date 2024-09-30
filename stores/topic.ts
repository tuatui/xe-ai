export interface TopicData {
  id: number;
  title: string;
  preferSetting?: DefaultBotSetting;
  createTime: Date;
  updateTime: Date;
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

  // TODO: 需要重构IDB模块

  // 删除后不会自动更新
  const removeTopic = async (topicID: number) => {
    const idb = await iDB.onDBReady();
    await idb.delete(IDB_VAR.TOPICS, topicID);
  };
  const updateCache = async () => (topics.value = await getTopicData());

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
  // TODO: updateTopic需要删除，并且所有api应该改为此种格式
  const updateTopic2 = async (topicData?: Partial<TopicData>) => {
    let res: IDBValidKey | undefined;
    const clonedData = cloneDeep(topicData);
    try {
      if (!clonedData) throw new Error("could not clone data");
      taskCount.value++;
      const db = await iDB.onDBReady();
      if (topicData?.id === undefined)
        res = await db.add(IDB_VAR.TOPICS, clonedData);
      else {
        const oldData: TopicData = await db.get(IDB_VAR.TOPICS, topicData.id);
        const mergedData = mergeDeep(oldData, clonedData);
        res = await db.put(IDB_VAR.TOPICS, mergedData);
      }
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
    updateCache,
  };
});
