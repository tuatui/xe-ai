export interface ChatCannelData {
  syncChatStatus?: {
    topicId: number;
    isProducing: boolean;
    isChatting: boolean;
  };
  updateChatData?: ChatData;
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
      data: { stopChat, syncChatStatus, updateSetting, updateChatData },
    } = ev;
    // chat session
    if (syncChatStatus) {
      const currChatStore = globalSharedChats.get(syncChatStatus.topicId);
      if (currChatStore) {
        currChatStore.value.isProducing = syncChatStatus.isProducing;
        currChatStore.value.isChatting = syncChatStatus.isChatting;
      }
    }
    if (updateChatData) {
      const topic = globalSharedChats.get(updateChatData.topicId);
      const res = topic?.value.chats.findLast(
        ({ id }) => updateChatData.id === id,
      );
      if (res) Object.assign(res, updateChatData);
      else topic?.value.chats.push(updateChatData);
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
      if (currChatStore) {
        currChatStore.value.tempStore.chatSetting ??= {};
        Object.assign(
          currChatStore.value.tempStore.chatSetting,
          updateSetting.setting,
        );
      }
    }
  };

  const postWinMessage = (data: ChatCannelData) =>
    chatChannel.postMessage(data);

  return { globalSharedChats, postWinMessage };
});
