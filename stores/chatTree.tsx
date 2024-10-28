import { ChatTabs, ChatTabsMobile, ChatTabsWelcome } from "#components";
import { ViewTree, type ViewTreeWithMeta } from "#imports";

export interface ChatTreeOrdinaryData {
  topicIds?: number[];
  currTopicId?: number;
  isCollapse?: boolean;
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
      [new ViewTree(true, (key) => <ChatTabsWelcome uniqueKey={key} />)],
      1,
    ),
  );
  const init = () => {
    tree.value = new ViewTree(true, (key) =>
      defaultSettingSync().mobile.isMobileScreen ? (
        <ChatTabsMobile uniqueKey={key} />
      ) : (
        <ChatTabs uniqueKey={key} />
      ),
    );
  };
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
      if (!defaultSettingSync().mobile.isMobileScreen) {
        tree.value = buildFromOrdinary(info.vt);
      } else {
        const res = buildFromOrdinaryM(info.vt);
        if (res) tree.value.children = [res];
      }
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
      if (focusedChat.chatTabsExpose) return;
      else {
        tree.value = new ViewTree(
          true,
          (key) => <ChatTabs uniqueKey={key} />,
          false,
          [],
          1,
        );
      }
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
        isCollapse: tab.isCollapse,
      };
    };

    const rawTree = toRaw(tree.value);
    return rawTree.parse(coverMeta);
  };

  const addTopicOneByOne = async (
    data: ChatTreeOrdinaryData,
    tabsKey: symbol,
  ) => {
    const { topicIds, currTopicId, isCollapse } = data;
    if (!topicIds) return;

    const tab = chatTabsStore().globalSharedTabs.get(tabsKey)?.value;
    if (!tab) {
      console.warn("找不到tab页");
      return;
    }
    tab.isCollapse = isCollapse;
    const topics = tab.topics;

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
      else tab.expose?.add(topicData);
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
  const buildFromOrdinaryM = (data: ChatTreeOrdinary): ViewTree | void => {
    if (data.isLeaf) {
      return new ViewTree(
        data.isLeaf,
        (key) => {
          const meta = data.meta;
          if (meta) setTimeout(() => addTopicOneByOne(meta, key));
          return <ChatTabsMobile uniqueKey={key} />;
        },
        data.isVertical,
        [],
        data.space,
      );
    }
    for (const vt of data.children) {
      const res = buildFromOrdinaryM(vt);
      if (res) return res;
    }
    return;
  };

  return { tree, add, buildFromOrdinary, toOrdinary, init };
});
