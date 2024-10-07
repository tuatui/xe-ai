export const chatTabsStore = defineStore("chat-tabs", () => {
  const globalSharedTabs = ref(
    new Map<
      symbol,
      Ref<{
        topics: TopicData[];
        currTab: number | undefined;
        expose?: ChatTabsExpose;
      }>
    >(),
  );

  return { globalSharedTabs };
});
