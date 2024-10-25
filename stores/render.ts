export const chatRender = defineStore("global-chat-render-task", () => {
  const map = new Map<number, Promise<string>>();
  const render = (key: number, md: string): Promise<string> => {
    const res = map.get(key);
    if (res) return res;

    const job = htmlRender(md);
    map.set(key, job);
    job.then(() => map.delete(key));

    return job;
  };
  return { render };
});
