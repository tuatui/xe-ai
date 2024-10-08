import type { ChatData, ChatInterface, ChatCreationData } from "./type";

export class ChatServer implements ChatInterface {
  constructor(private $client = useNuxtApp().$client) {}
  get = async (topicId: number) => {
    let chatData: ChatData[];
    try {
      const res = await this.$client.chat.getFromTopic.query(topicId);
      chatData = res.chats;
    } catch (error) {
      chatData = [];
      console.error(error);
    }
    return chatData;
  };
  update = async (data: ChatCreationData) => {
    try {
      if (data.id === undefined) {
        const { id } = await this.$client.chat.create.mutate(data);
        return id;
      } else {
        const { id } = await this.$client.chat.update.mutate(data as ChatData);
        return id;
      }
    } catch (error) {
      console.error(error);
      return -1;
    }
  };
}
