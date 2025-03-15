export const chatRender = defineStore("global-chat-render-task", () => {
  const map = new Map<number, Promise<ProcessCtx>>();
  const render = (key: number, md: ProcessCtx): Promise<ProcessCtx> => {
    const res = map.get(key);
    if (res) return res;

    const job = htmlRender(md);
    map.set(key, job);
    job.then(() => map.delete(key));

    return job;
  };
  return { render };
});
