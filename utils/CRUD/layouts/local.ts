import type {
  VTLayoutData,
  UpdateVTLayoutData,
  VTLayoutInterface,
} from "./type";

export class Layouts implements VTLayoutInterface {
  constructor(private iDB = useIndexedDBStore()) {}

  public get = async (id?: number): Promise<VTLayoutData[]> => {
    let res: VTLayoutData[] = [];
    try {
      const db = await this.iDB.onDBReady();
      if (id === undefined) {
        return await db.getAll(IDB_VAR.LAYOUTS);
      } else res = [await db.get(IDB_VAR.LAYOUTS, id)];
    } catch (error) {
      console.error(error);
    }
    return res;
  };

  public update = async (data: UpdateVTLayoutData) => {
    let res: number = -1;
    try {
      const rawData = toRaw(data);
      const db = await this.iDB.onDBReady();
      if (data.id === undefined) {
        data.createTime = new Date();
        res = (await db.add(IDB_VAR.LAYOUTS, rawData)) as number;
      } else {
        const oldData: VTLayoutData = await db.get(IDB_VAR.LAYOUTS, data.id);
        const mergedData = mergeDeep(oldData, rawData);
        mergedData.createTime = new Date();
        res = (await db.put(IDB_VAR.LAYOUTS, mergedData)) as number;
      }
    } catch (error) {
      console.error(error);
    }
    return res;
  };
  public remove = async (layoutId: number) => {
    const idb = await this.iDB.onDBReady();
    await idb.delete(IDB_VAR.LAYOUTS, layoutId);
  };
}
