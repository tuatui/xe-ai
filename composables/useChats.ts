import type { ChatToolCall } from "~/utils";

export interface UseChatTempStore {
  scrollTop?: number;
  chatSetting?: {
    useBotData?: BotsData;
    useModelName?: string;
    useTools?: string[];
  };
  shareEvent?: {
    title?: string;
    close?: boolean;
    initChat?: {
      userInput: string;
      botData: BotsData;
      modelName: string;
      tools: string[];
    };
  };
}

export type useChatReturn = Ref<{
  chats: ChatData[];
  tempStore: UseChatTempStore;
  isPending: boolean;
  isChatting: boolean;
  isProducing: boolean;
  updateChat: (
    data: {
      context: string;
      from: number;
      id?: number;
      reasoningContent?: string;
      toolCalls?: ChatToolCall[];
      toolCallId?: string;
      provider: Provider;
    },
    autoUpdateCache?: boolean,
  ) => Promise<number>;
  chatRefCount: number;
  stopChatting: () => void;
}>;

export const useChats = (topicId: number): useChatReturn => {
  const chatLocal = new ChatLocal();
  const chatServer = new ChatServer();
  const ts = loginStore();

  const chats = ref<ChatData[]>([]);
  const tempStore = ref<UseChatTempStore>({});
  const taskCount = ref(0);
  const isPending = computed(() => taskCount.value > 0);
  /** 控制暂停按钮是否显示 */
  const isProducing = ref(false);
  /** 表示聊天是否真正停止 */
  const isChatting = ref(false);
  const stopChatting = ref(() => {});

  const getChatsData = async (): Promise<ChatData[]> => {
    taskCount.value++;
    const chatData = ts.isLogin
      ? await chatServer.get(topicId)
      : await chatLocal.get(topicId);
    taskCount.value--;

    return chatData;
  };

  getChatsData().then((val) => (chats.value = val));

  const updateChat = async (
    data: {
      context: string;
      from: number;
      id?: number;
      reasoningContent?: string;
      provider: Provider;
      toolCalls?: ChatToolCall[];
      toolCallId?: string;
    },
    autoUpdateCache = true,
  ) => {
    taskCount.value++;
    const res = ts.isLogin
      ? await chatServer.update({
          ...data,
          topicId,
        })
      : await chatLocal.update({
          ...data,
          topicId,
        });
    if (autoUpdateCache) {
      if (data.id === undefined) {
        chats.value.push({
          ...data,
          id: res,
          topicId,
        });
      } else {
        const index = chats.value.findLastIndex((chat) => chat.id === data.id);
        if (index >= 0) {
          chats.value[index] = { ...data, id: res, topicId };
        }
      }
    }
    taskCount.value--;
    return res;
  };
  const chatRefCount = ref(0);
  return ref({
    chats,
    isPending,
    updateChat,
    chatRefCount,
    tempStore,
    isProducing,
    isChatting,
    stopChatting,
  });
};
