export const chatTabsStore = defineStore("chat-tabs", () => {
  const globalSharedTabs = ref(
    new Map<
      Symbol,
      Ref<{
        topics: TopicData[];
        currTab: number | undefined;
        expose?: ChatTabsExpose
      }>
    >()
  );

  return { globalSharedTabs };
});
