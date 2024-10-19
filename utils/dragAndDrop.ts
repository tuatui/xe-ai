interface DragAndDropChatData {
  topic: TopicData;
  isMove?: { fromTab: symbol };
}

export const dragAndDropChat = {
  setData: (
    ev: DragEvent,
    data: DragAndDropChatData,
    opt?: { el?: Element; effect?: DataTransfer["effectAllowed"] },
  ) => {
    const dataId = crypto.randomUUID();
    globalStore().map.set(dataId, data);
    ev.dataTransfer!.setData("text/plain", dataId);
    if (!opt) return;
    const { el, effect } = opt;
    if (el) ev.dataTransfer!.setDragImage(el, 0, 0);
    if (effect) ev.dataTransfer!.effectAllowed = effect;
  },

  getData: (ev: DragEvent): DragAndDropChatData | undefined => {
    const dataId = ev.dataTransfer!.getData("text");
    const { map } = globalStore();

    const res = map.get(dataId);
    if (res) {
      map.delete(dataId);
      return res;
    }
  },
};
