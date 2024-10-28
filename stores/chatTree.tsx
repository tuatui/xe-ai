import { ChatTabs, ChatTabsMobile, ChatTabsWelcome } from "#components";
import { ViewTree, type ViewTreeWithMeta } from "#imports";

export interface ChatTreeOrdinaryData {
  topicIds?: number[];
  currTopicId?: number;
  isCollapse?: boolean;
  inputHeight?: number;
  type?: LeafType;
}
export interface ChatTreeOrdinary
  extends ViewTreeWithMeta<ChatTreeOrdinaryData> {}

export const enum LeafType {
  tabs = 0,
  tabsM,
  welcome,
}

// 如果还要再添加组件，我们最好找个灵活一些的方法。
const createChatLeaf = (
  key: symbol,
  type: LeafType = LeafType.tabs,
): JSX.Element => {
  if (type === LeafType.tabs) return <ChatTabs uniqueKey={key} />;
  else if (type === LeafType.tabsM) return <ChatTabsMobile uniqueKey={key} />;
  else if (type === LeafType.welcome)
    return <ChatTabsWelcome uniqueKey={key} />;

  console.warn("未知的组件id" + type);
  return <ChatTabs uniqueKey={key} />;
};

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
    tree.value.children = [
      new ViewTree(true, (key) =>
        defaultSettingSync().mobile.isMobileScreen ? (
          <ChatTabsMobile uniqueKey={key} />
        ) : (
          <ChatTabs uniqueKey={key} />
        ),
      ),
    ];
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

      // 加载缓存的viewTree
      if (!defaultSettingSync().mobile.isMobileScreen) {
        tree.value = buildFromOrdinary(info.vt);
      } else {
        const res = buildFromOrdinaryM(info.vt);
        if (res) tree.value.children = [res];
      }
      // 对于保存了空页面的情况，多推一个欢迎页
      if (!tree.value.isLeaf && tree.value.children.length === 0)
        tree.value.children = [
          new ViewTree(true, (key) => <ChatTabsWelcome uniqueKey={key} />),
        ];
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
      else tree.value = new ViewTree(false);
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
        inputHeight: tab.inputHeight,
        type: tab.type,
      };
    };

    const rawTree = toRaw(tree.value);
    return rawTree.parse(coverMeta);
  };

  const addTopicOneByOne = async (
    data: ChatTreeOrdinaryData,
    tabsKey: symbol,
  ) => {
    const { topicIds, currTopicId, isCollapse, inputHeight } = data;
    if (!topicIds) return;

    const tab = chatTabsStore().globalSharedTabs.get(tabsKey)?.value;
    if (!tab) {
      console.warn("找不到tab页");
      return;
    }
    tab.isCollapse = isCollapse;
    tab.inputHeight = inputHeight;
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
      data.isLeaf
        ? (key) => {
            const meta = data.meta;
            if (meta) setTimeout(() => addTopicOneByOne(meta, key));
            return createChatLeaf(key, meta?.type);
          }
        : undefined,
      data.isVertical,
      data.children.map(buildFromOrdinary),
      data.space,
    );
  const buildFromOrdinaryM = (data: ChatTreeOrdinary): ViewTree | void => {
    if (data.isLeaf) {
      return new ViewTree(
        data.isLeaf,
        data.isLeaf
          ? (key) => {
              const meta = data.meta;
              if (meta) setTimeout(() => addTopicOneByOne(meta, key));
              return createChatLeaf(key, meta?.type);
            }
          : undefined,
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
