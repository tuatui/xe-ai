export interface TopicData {
  id: number;
  title?: string;
  preferSetting?: Partial<DefaultBotSetting>;
  updateTime: Date;
}

export type TopicCreationData = Omit<TopicData, "id"> &
  Pick<Partial<TopicData>, "id">;

export interface TopicInterface {
  /**
   * 获取话题
   * @param {number} id - 若不给出id会获取全部
   * @todo 需要增加一些查询方式
   */
  get: (arg: {
    id?: number;
    page?: CommonPaginationQuery;
  }) => Promise<{ res: TopicData[]; page: CommonPagination }>;
  /**
   * 删除话题
   */
  remove: (id: number) => Promise<void>;
  /**
   * 新增或修改话题
   * @param {TopicCreationData} data - 若不给出id会新增，给出则修改
   */
  update: (data: TopicCreationData) => Promise<number>;
}
