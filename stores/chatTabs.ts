export const chatTabsStore = defineStore("chat-tabs", () => {
  const globalSharedTabs = ref<
    Map<
      Symbol,
      Ref<{
        topics: TopicData[];
        currTab: number | undefined;
      }>
    >
  >(new Map());

  return { globalSharedTabs };
});
