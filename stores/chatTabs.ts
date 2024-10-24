export interface ChatTabsData {
  topics: TopicData[];
  currTab: number | undefined;
  expose?: ChatTabsExpose;
  isCollapse?: boolean;
}

export const chatTabsStore = defineStore("chat-tabs", () => {
  const globalSharedTabs = ref(new Map<symbol, Ref<ChatTabsData>>());

  return { globalSharedTabs };
});
