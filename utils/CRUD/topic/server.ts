import type { TopicInterface } from "./type";

export class Topic implements TopicInterface {
  constructor(private $client = useNuxtApp().$client) {}
  public get = async (id?: number): Promise<TopicData[]> => {
    try {
      return (await this.$client.topic.get.mutate({ id })).map((topic) => ({
        ...topic,
        updateTime: new Date(topic.updateTime),
        title: topic.title ?? "",
      }));
    } catch (error) {
      console.error(error);
      return [];
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
}
