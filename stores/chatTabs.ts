import type { LeafType } from "./chatTree";

export interface ChatTabsData {
  topics: TopicData[];
  currTab: number | undefined;
  expose?: ChatTabsExpose;
  isCollapse?: boolean;
  inputHeight?: number;
  type?: LeafType;
}

export const chatTabsStore = defineStore("chat-tabs", () => {
  const globalSharedTabs = ref(new Map<symbol, Ref<ChatTabsData>>());

  return { globalSharedTabs };
});
