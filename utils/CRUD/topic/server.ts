import type { TopicInterface, TopicCreationData } from "./type";
import type { ChatCreationData } from "~/utils";
interface SyncTopicInput extends TopicCreationData {
  chats: ChatCreationData[];
}

export class Topic implements TopicInterface {
  constructor(private $client = useNuxtApp().$client) {}
  public get = async (input: {
    id?: number;
    page?: CommonPaginationQuery;
  }): Promise<{ res: TopicData[]; page: CommonPagination }> => {
    try {
      const { res, page } = await this.$client.topic.get.mutate(input);
      return {
        res: res.map(
          ({ preferSetting: { preferBotID, preferModelName }, ...topic }) => ({
            ...topic,
            updateTime: new Date(topic.updateTime),
            title: topic.title ?? "",
            preferSetting: {
              preferBotID: preferBotID ?? undefined,
              preferModelName: preferModelName ?? undefined,
            },
          }),
        ),
        page,
      };
    } catch (error) {
      console.error(error);
      return { res: [], page: { size: 0, step: 0, total: 0 } };
    }
  };
  public remove = async (id: number) => {
    try {
      await this.$client.topic.delete.mutate({ id });
    } catch (error) {
      console.error(error);
    }
  };
  public update = async (data: TopicCreationData): Promise<number> => {
    try {
      if (data.id === undefined) {
        const { id } = await this.$client.topic.create.mutate({
          title: data.title,
        });
        return id;
      } else {
        await this.$client.topic.update.mutate(data as TopicData);
        return data.id;
      }
    } catch (error) {
      console.error(error);
      return -1;
    }
  };
  public sync = (data: SyncTopicInput[]) =>
    this.$client.topic.sync.mutate(data);
}
