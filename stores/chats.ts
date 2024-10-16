export interface ChatCannelData {
  updateChat?: {
    isCreate?: boolean;
    topicId: number;
    chats: ChatData[];
    isProducing: boolean;
    isChatting: boolean;
  };
  updateSetting?: {
    setting: UseChatTempStore["chatSetting"];
    topicId: number;
  };
  stopChat?: {
    topicId: number;
  };
}

export const chatsStore = defineStore("chats-store", () => {
  const globalSharedChats = new Map<number, useChatReturn>();

  const chatChannel = new BroadcastChannel("XeAIChatChannel");
  chatChannel.onmessage = (ev: MessageEvent<ChatCannelData>) => {
    const {
      data: { stopChat, updateChat, updateSetting },
    } = ev;

    if (updateChat) {
      const currChatStore = globalSharedChats.get(updateChat.topicId);
      if (currChatStore) {
        currChatStore.value.isProducing = updateChat.isProducing;
        currChatStore.value.isChatting = updateChat.isChatting;

        if (updateChat.isCreate)
          currChatStore.value.chats.push(...updateChat.chats);
        else {
          updateChat.chats.forEach((eachUpdateChat) => {
            const index = currChatStore.value.chats.findLastIndex(
              (currChat) => currChat.id === eachUpdateChat.id,
            );
            if (index < 0) return;
            currChatStore.value.chats[index] = eachUpdateChat;
          });
        }
      }
    }

    if (stopChat) {
      const currChatStore = globalSharedChats.get(stopChat.topicId);
      if (currChatStore) {
        currChatStore.value.stopChatting();
        currChatStore.value.isProducing = false;
      }
    }
    if (updateSetting) {
      const currChatStore = globalSharedChats.get(updateSetting.topicId);
      if (currChatStore)
        currChatStore.value.tempStore.chatSetting = updateSetting.setting;
    }
  };

  const postWinMessage = (data: ChatCannelData) =>
    chatChannel.postMessage(data);

  return { globalSharedChats, postWinMessage };
});
