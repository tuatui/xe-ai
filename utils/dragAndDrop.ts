interface DragAndDropChatData {
  topic: TopicData;
  isMove?: { fromTab: symbol };
}

// eslint-disable-next-line no-extra-boolean-cast
const randomDataId = Boolean(globalThis?.crypto?.randomUUID)
  ? globalThis.crypto.randomUUID
  : () => (Date.now() + Math.random()).toString(36);

export const dragAndDropChat = {
  setData: (
    ev: DragEvent,
    data: DragAndDropChatData,
    opt?: { el?: Element; effect?: DataTransfer["effectAllowed"] },
  ) => {
    const dataId = randomDataId();
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
