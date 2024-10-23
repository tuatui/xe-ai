import { ChatTabs } from "#components";
import { ViewTree, type ViewTreeWithMeta } from "#imports";

export interface ChatTreeOrdinaryData {
  topicIds?: number[];
  currTopicId?: number;
}
export interface ChatTreeOrdinary
  extends ViewTreeWithMeta<ChatTreeOrdinaryData> {}

export const chatTreeStore = defineStore("chat-tree-store", () => {
  const tabsStore = chatTabsStore();
  const focusedChat = focusedChatStore();
  const tree = ref<ViewTree>(
    new ViewTree(
      false,
      undefined,
      false,
      [new ViewTree(true, (key) => <ChatTabs uniqueKey={key} />, false, [], 1)],
      1,
    ),
  );
  watch(
    () => defaultBotStore().defaultBotInfo,
    async (info) => {
      if (!info) return;

      if (
        (info.doNotMemoVtOnUnload && info.useCustomVT === undefined) ||
        !info.vt
      )
        return;
      await nextTick();
      // 加载缓存的viewTree
      tree.value = buildFromOrdinary(info.vt);
    },
    { once: true },
  );
  const add = async (topic: TopicData) => {
    if (tree.value.children.length >= 1) {
      if (focusedChat.chatTabsExpose) {
        focusedChat.chatTabsExpose.add(topic);
        return;
      }
      for (const [_, val] of tabsStore.globalSharedTabs) {
        if (!val.value.expose) continue;
        focusedChat.chatTabsExpose = val.value.expose;
        focusedChat.chatTabsExpose.add(topic);
        break;
      }
      if (!focusedChat.chatTabsExpose)
        console.warn("存在标签页但是找不到可用的导出");

      return;
    }
    const newVT = new ViewTree(
      true,
      (key) => <ChatTabs uniqueKey={key} />,
      false,
      [],
      1,
    );
    tree.value.children.push(newVT);
    await nextTick();
    focusedChat.chatTabsExpose?.add(topic);
  };

  const toOrdinary = (): ChatTreeOrdinary => {
    const { globalSharedTabs: tabs } = chatTabsStore();
    const coverMeta = (vt: ViewTree): ChatTreeOrdinaryData => {
      const tab = tabs.get(vt.uniqueKey)?.value;
      if (!tab) return {};
      return {
        topicIds: tab.topics.map((each) => each.id),
        currTopicId: tab.currTab,
      };
    };

    const rawTree = toRaw(tree.value);
    return rawTree.parse(coverMeta);
  };

  const addTopicOneByOne = async (
    data: ChatTreeOrdinaryData,
    tabsKey: symbol,
  ) => {
    const { topicIds, currTopicId } = data;
    if (!topicIds) return;

    const tab = chatTabsStore().globalSharedTabs.get(tabsKey)?.value.expose;
    if (!tab) {
      console.warn("找不到tab页");
      return;
    }
    const topics = tab.getAll();

    const { getTopicData } = topicStore();
    for (const id of topicIds) {
      const {
        res: [topicData],
      } = await getTopicData({ id });
      if (!topicData) {
        console.warn("查找不到话题数据：", id);
        continue;
      }
      if (id !== currTopicId) topics.push(topicData);
      else tab.add(topicData);
    }
  };

  const buildFromOrdinary = (data: ChatTreeOrdinary): ViewTree =>
    new ViewTree(
      data.isLeaf,
      (key) => {
        const meta = data.meta;
        if (meta) setTimeout(() => addTopicOneByOne(meta, key));
        return <ChatTabs uniqueKey={key} />;
      },
      data.isVertical,
      data.children.map(buildFromOrdinary),
      data.space,
    );

  return { tree, add, buildFromOrdinary, toOrdinary };
});
