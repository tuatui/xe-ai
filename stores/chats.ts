export const chatsStore = defineStore("chats-store", () => {
  const globalSharedChats = new Map<
    number,
    ReturnType<typeof useChats>
  >();

  return { globalSharedChats };
});
