import type { ChatTreeOrdinary } from "~/stores/chatTree";

interface LayoutDataBase {
  vt: ChatTreeOrdinary;
  name: string;
}
interface LayoutDataUpdate {
  id: number;
  createTime: Date;
}
export interface VTLayoutData extends LayoutDataBase, LayoutDataUpdate {}
export interface UpdateVTLayoutData
  extends LayoutDataBase,
    Partial<LayoutDataUpdate> {}

export interface VTLayoutInterface {
  get: (id?: number) => Promise<VTLayoutData[]>;
  remove: (id: number) => Promise<void>;
  update: (data: UpdateVTLayoutData) => Promise<number>;
}
