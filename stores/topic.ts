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
    autoUpdateCache = true,
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

  const getTopic = async (
    input: {
      id?: number;
      page?: CommonPaginationQuery;
    } = {},
  ) => {
    let res;
    taskCount.value++;

    if (ls.isLogin) res = await topicServer.get(input);
    else res = await topicLocal.get(input);
    taskCount.value--;

    return res;
  };

  const removeTopic = async (id: number) => {
    if (ls.isLogin) await topicServer.remove(id);
    else await topicLocal.remove(id);

    const res = topics.value.findIndex((topic) => topic.id === id);
    if (res < 0) return;
    topics.value.splice(res, 1);
  };

  const updateCache = async () => triggerRef(topics);

  const chatLocal = new ChatLocal();
  const getAllWithChat = async (limit?: number) => {
    const t = await topicLocal.getSome(undefined, limit);
    const res = await Promise.all(
      t.map(async (topic) => {
        const chats = await chatLocal.get(topic.id);
        return { ...topic, chats };
      }),
    );
    return res;
  };
  const syncTopic = async () => {
    let count = await topicLocal.count();
    const chunkSize = 8;
    while (count > 0) {
      const thisChunkSize = Math.min(count, chunkSize);
      count -= thisChunkSize;
      const res = await getAllWithChat(thisChunkSize);
      await topicServer.sync(res);
      await Promise.all(res.map(({ id }) => topicLocal.remove(id)));
      topics.value.unshift(...res.map(({ chats: _, ...topic }) => topic));
      triggerRef(topics);
    }
  };

  watch(
    () => ls.userInfo?.name,
    () => updateCache(),
    { immediate: true },
  );

  return {
    topics,
    isPending,
    updateTopic,
    removeTopic,
    getTopicData: getTopic,
    updateCache,
    getAllWithChat,
    syncTopic,
  };
});
