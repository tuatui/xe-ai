import type { DefineComponent, VNode } from "vue";
import type { UnknownRecord } from "type-fest";

export enum Provider {
  OpenAI,
  //...
}

export interface ChatChunk {
  index: number;
  delta: ChatDeltaData;
  finish_reason?: string | null;
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
export enum ToolCallResStatus {
  success,
  error,
}
export interface ToolCallSuccessReturn {
  code: ToolCallResStatus.success;
  res: UnknownRecord;
  id: string;
}
export interface ToolCallErrReturn {
  code: ToolCallResStatus.error;
  err: Error;
  id: string;
}
export type ToolCallReturn = ToolCallSuccessReturn | ToolCallErrReturn;

export type ChatDeltaData = Omit<ChatData, "id" | "topicId">;
export interface ToolCallCompProps {
  toolCall: ChatToolCall;
}
export interface ChatTool {
  name: string;
  icon: () => JSX.Element;
  tool: unknown;
  component: DefineComponent<ToolCallCompProps, {}, {}, {}, {}>;
  i18nKey: string;
  exec: (data: ChatToolCall) => Promise<ToolCallReturn>;
}

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
    sessionParamsDocLink?: string;
  };
  readonly tools: ChatTool[];
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
  createChat: (
    chatData: ChatData[],
    model: string,
    opt?: { toolNames?: string[]; exConf?: string },
  ) => ChatStream;
  formatMessage?: (chats: ChatData[]) => unknown;
  getModelList?: () => Promise<ModelList[]>;
}
