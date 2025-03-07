export const chatEditStore = defineStore("global-chat-edit-dialog", () => {
  const isOpen = ref(false);
  const form = ref<Partial<ChatData>>({});
  let originData: ChatData | undefined = undefined;
  const cancel = () => {
    isOpen.value = false;
    currEditPromise();
  };
  const confirm = () => {
    isOpen.value = false;
    if (!originData) {
      currEditPromise();
      return;
    }
    const req = { ...originData, ...form.value };
    const { globalSharedChats } = chatsStore();
    const topic = globalSharedChats.get(req.topicId) || useChats(req.topicId);
    topic.value.updateChat(req);
    currEditPromise(req);
  };
  let currEditPromise = (_: ChatData | void) => {};
  const edit = (init: ChatData) =>
    new Promise<ChatData | void>((re) => {
      isOpen.value = true;
      originData = init;
      form.value = cloneDeep(init);
      currEditPromise = re;
    });
  const add = () =>
    new Promise<ChatData | void>((re) => {
      isOpen.value = true;
      originData = undefined;
      form.value = {};
      currEditPromise = re;
    });
  return {
    isOpen,
    form,
    originData,
    cancel,
    confirm,
    edit,
    add,
  };
});
