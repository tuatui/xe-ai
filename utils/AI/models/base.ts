import type { VNode } from "vue";

export enum Provider {
  OpenAI,
  //...
}

export interface ChatChunk {
  context: string;
  /* 思维链模型可能具有此字段，用于显示推理内容 */
  reasoning_content: string | null | undefined;
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
  readonly info: {
    provider: string;
    key: Provider;
    icon: VNode;
    defaultBaseUrl: string;
  };
  createChatSession: (conf: Partial<ChatSessionConf>) => Promise<ChatSession>;
}
export interface ModelList {
  name: string;
  owner: string;
  provider?: string;
}
export interface ChatStream extends AsyncIterable<ChatChunk> {
  stop: () => void;
}
export interface ChatSession {
  createChat: (chatData: ChatData[], model: string) => Promise<ChatStream>;
  formatMessage?: (chats: ChatData[]) => unknown;
  getModelList?: () => Promise<ModelList[]>;
}
