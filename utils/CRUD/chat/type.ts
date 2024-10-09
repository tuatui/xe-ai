export interface ChatData {
  id: number;
  topicId: number;
  context: string;
  from: ChatRole;
}
export type ChatCreationData = Omit<ChatData, "id"> &
  Pick<Partial<ChatData>, "id">;

export enum ChatRole {
  system = 0,
  user,
  assistant,
}
export interface ChatInterface {
  get: (topicId: number) => Promise<ChatData[]>;
  update: (data: ChatCreationData) => Promise<number>;
}
