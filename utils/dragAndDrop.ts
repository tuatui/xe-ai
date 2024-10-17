interface DragAndDropChatData {
  topic: TopicData;
  isMove?: { fromTab: symbol };
}

export const dragAndDropChat = {
  setData: (ev: DragEvent, data: DragAndDropChatData) => {
    const dataId = crypto.randomUUID();
    globalStore().map.set(dataId, data);
    ev.dataTransfer!.setData("text/plain", dataId);
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
