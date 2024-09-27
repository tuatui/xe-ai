import processes from "./Processes";

export type ProcessFn = (pre: string) => string | Promise<string>;

export const htmlRender = async (text: string) => {
  for (const process of processes) text = await process(text);
  return text;
};
