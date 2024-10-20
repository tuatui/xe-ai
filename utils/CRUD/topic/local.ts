import type { TopicCreationData, TopicInterface } from "./type";

export class Topic implements TopicInterface {
  constructor(private iDB = useIndexedDBStore()) {}
  public count = async () => {
    const idb = await this.iDB.onDBReady();
    return await idb.count(IDB_VAR.TOPICS);
  };
  public getSome = async (
    id?: IDBValidKey,
    limit?: number,
  ): Promise<TopicData[]> => {
    let res: TopicData[] = [];
    try {
      const db = await this.iDB.onDBReady();
      if (id === undefined) {
        res = [];
        const i = db
          .transaction(IDB_VAR.TOPICS)
          .store.index(IDB_VAR.TOPICS_KEY.UPDATE_TIME);
        if (limit === undefined) {
          for await (const { value } of i.iterate(undefined, "prev"))
            res.push(value);
        } else {
          for await (const { value } of i.iterate(undefined, "prev")) {
            if (limit <= 0) break;
            limit--;

            res.push(value);
          }
        }
      } else res = [await db.get(IDB_VAR.TOPICS, id)];
    } catch (error) {
      console.error(error);
    }
    return res;
  };

  public get = async ({
    id,
    page,
  }: {
    id?: IDBValidKey;
    page?: CommonPaginationQuery;
  }): Promise<{ res: TopicData[]; page: CommonPagination }> => {
    const db = await this.iDB.onDBReady();
    if (page === undefined) {
      const [res, total] = await Promise.all([
        this.getSome(id),
        db.count(IDB_VAR.TOPICS),
      ]);
      const size = id === undefined ? total : 1;
      return { res, page: { total, step: 0, size } };
    }

    try {
      const res: TopicData[] = [];
      let offset = page.size * page.step;
      let count = page.size;

      const i = db
        .transaction(IDB_VAR.TOPICS)
        .store.index(IDB_VAR.TOPICS_KEY.UPDATE_TIME);

      for await (const cursor of i.iterate(undefined, "prev")) {
        if (offset > 0) {
          offset--;
          continue;
        }

        if (count <= 0) break;

        res.push(cursor.value);
        count--;
      }
      const total = await db.count(IDB_VAR.TOPICS);
      return { res, page: { total, step: 0, size: page.size } };
    } catch (error) {
      console.error(error);
    }
    return { res: [], page: { total: 0, step: 0, size: 0 } };
  };
  public update = async (topicData: TopicCreationData) => {
    let res: number = -1;
    const clonedData = toRawDeep(topicData);
    try {
      const db = await this.iDB.onDBReady();
      if (topicData?.id === undefined) {
        res = (await db.add(IDB_VAR.TOPICS, clonedData)) as number;
      } else {
        const oldData: TopicData = await db.get(IDB_VAR.TOPICS, topicData.id);
        const mergedData = mergeDeep(oldData, clonedData);
        mergedData.updateTime = new Date();
        res = (await db.put(IDB_VAR.TOPICS, mergedData)) as number;
      }
    } catch (error) {
      console.error(error);
    }
    return res;
  };
  public remove = async (topicID: number) => {
    const idb = await this.iDB.onDBReady();
    await idb.delete(IDB_VAR.TOPICS, topicID);
  };
}
/* window.ttttt = Topic; */
