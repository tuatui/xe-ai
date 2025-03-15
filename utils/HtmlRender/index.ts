import processes from "./Processes";
export interface ProcessCtx {
  text: string;
  isMDPartialRender?: boolean;
  shouldFullRender?: boolean;
}
export type ProcessFn = (pre: ProcessCtx) => ProcessCtx | Promise<ProcessCtx>;

export const htmlRender = async (ctx: ProcessCtx) => {
  for (const process of processes) ctx = await process(ctx);
  return ctx;
};
