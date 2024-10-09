export interface ChatTabsExpose {
  add: (topic: TopicData) => void;
  getAll: () => TopicData[];
  getCurr: () => TopicData | undefined;
}
export const focusedChatStore = defineStore("focused-chat", () => {
  const chatTabsExpose = ref<ChatTabsExpose>();
  return { chatTabsExpose };
});
