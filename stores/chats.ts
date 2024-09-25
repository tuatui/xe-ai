export const chatsStore = defineStore("chats-store", () => {
  const globalSharedChats = new Map<number, useChatReturn>();

  return { globalSharedChats };
});
