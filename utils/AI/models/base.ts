export interface ChatChunk {
  context: string;
  [key: string]: unknown;
}
export interface ChatBase {
  createChat: (...args: any[]) => AsyncGenerator<ChatChunk>;
}
