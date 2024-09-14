export interface ChatChunk {
  context: string;
  source?: any;
  [key: string]: unknown;
}

export interface ChatSessionConf {
  timeout: number;
  apiKey: string;
  baseURL: string;
}
export const defaultChatSessionConf: Partial<ChatSessionConf> = {
  timeout: 120 * 1000, // 一些模型需要较长时间响应，例如o1
};
export interface ChatService {
  readonly feature?: {
    isSupportIMG?: boolean;
    isSupportAudio?: boolean;
  };
  readonly info: { provider: string };
  createChatSession: (conf: Partial<ChatSessionConf>) => ChatSession;
}

export interface ChatSession {
  createChat: (...args: any[]) => AsyncGenerator<ChatChunk>;
  formatMessage?: (chats: ChatData[]) => unknown;
  getModelList?: () => Promise<string[]>;
}
