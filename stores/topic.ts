type UseTopicCreationData = Omit<TopicCreationData, "updateTime"> &
  Pick<Partial<TopicCreationData>, "updateTime">;

export const topicStore = defineStore("topic-store", () => {
  const topicLocal = new TopicInLocal();
  const topicServer = new TopicInServer();

  const ls = loginStore();
  const topics = shallowRef<TopicData[]>([]);
  const taskCount = ref(0);
  const isPending = computed(() => taskCount.value > 0);

  const updateTopic = async (
    data: UseTopicCreationData,
    autoUpdateCache = true
  ): Promise<TopicData> => {
    const isCreate = data.id === undefined;

    let res: number;
    taskCount.value++;
    data.updateTime = new Date();
    if (ls.isLogin) res = await topicServer.update(data as TopicCreationData);
    else res = await topicLocal.update(data as TopicCreationData);
    data.id = res;
    taskCount.value--;

    if (autoUpdateCache) {
      if (isCreate) {
        topics.value.unshift(data as TopicData);

        triggerRef(topics);
      } else {
        const index = topics.value.findIndex((topic) => topic.id === res);
        if (index >= 0) {
          topics.value.splice(index, 1);
          topics.value.unshift(data as TopicData);
          triggerRef(topics);
        }
      }
    }
    return data as TopicData;
  };

  const getTopic = async (id?: number) => {
    let res: TopicData[];

    taskCount.value++;
    if (ls.isLogin) res = await topicServer.get(id);
    else res = await topicLocal.get(id);
    taskCount.value--;

    return res;
  };

  getTopic().then((v) => (topics.value = v));
  const removeTopic = async (id: number, autoUpdateCache = true) => {
    if (ls.isLogin) await topicServer.get(id);
    else await topicLocal.get(id);

    if (autoUpdateCache) {
      const res = topics.value.findIndex((topic) => topic.id === id);
      if (res < 0) return;
      topics.value.splice(res, 1);
      triggerRef(topics);
    }
  };

  const updateCache = async () => (topics.value = await getTopic());

  return {
    topics,
    isPending,
    updateTopic,
    removeTopic,
    getTopicData: getTopic,
    updateCache,
  };
});
