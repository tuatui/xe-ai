export interface ChatTabsExpose {
  add: (topic: TopicData) => void;
}
export const focusedChatStore = defineStore("focused-chat", () => {
  const chatTabsExpose = ref<ChatTabsExpose>();
  return { chatTabsExpose };
});
