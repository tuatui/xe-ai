import process from "./Processes";

export type ProcessFn = (pre: string) => string;

export const htmlRender = (text: string) =>
  process.reduce((pre, currProcess) => currProcess(pre), text);
