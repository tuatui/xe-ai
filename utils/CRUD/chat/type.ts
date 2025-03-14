export interface ChatToolCall {
  name: string;
  arg: string;
  type: string;
  id: string;
  index: number;
}

export type ChatData = {
  id: number;
  topicId: number;
  context: string;
  noMarkdownRender?: boolean;
  isDisabled?: boolean;
  reasoningContent?: string;
  toolCalls?: ChatToolCall[];
  toolCallId?: string;
  from: ChatRole;
  provider?: Provider;
  finishReason?: string;
  status?: ChatStatus;
};
export type ChatCreationData = Omit<ChatData, "id"> &
  Pick<Partial<ChatData>, "id">;

export enum ChatRole {
  system = 0,
  user,
  assistant,
  function,
  tool,
}
export enum ChatStatus {
  init,
  generating,
  finish,
}
export interface ChatInterface {
  get: (topicId: number) => Promise<ChatData[]>;
  update: (data: ChatCreationData) => Promise<number>;
}
