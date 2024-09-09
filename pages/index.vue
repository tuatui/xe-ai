<template>
  <VLayout>
    <VNavigationDrawer disable-resize-watcher permanent :width="width">
      <div class="h-full w-full flex flex-col">
        <VList class="grow">
          <VListItem
            v-for="item in topics"
            @click="handleAddChatTabs(item)"
            :key="item.id"
            color="primary"
          >
            <NavListItem
              :value="item.title || '无标题'"
              @remove="removeTopic(item.id)"
              @update="(v) => updateTopic(v, item.id)"
            />
          </VListItem>
        </VList>
        <VDivider />
        <SettingDialog />
      </div>
      <div
        ref="dragger"
        class="nav-dragger"
        :class="{ active: isDragging }"
        :style="{ left: `${position.x}px` }"
      ></div>
    </VNavigationDrawer>
    <VMain>
      <AdjustableView v-model="vt" />
    </VMain>
  </VLayout>
</template>
<script setup lang="tsx">
import { ChatTabs } from "#components";
const dragger = ref<HTMLElement | null>(null);
const width = ref(300);

const vt = ref(
  new ViewTree(
    false,
    undefined,
    false,
    [
      new ViewTree(true, (key) => <ChatTabs uniqueKey={key} />, false, [], 0.5),
      new ViewTree(true, (key) => <ChatTabs uniqueKey={key} />, false, [], 0.5),
    ],
    1
  )
);
const handleAddChatTabs = async (topic: TopicData) => {
  if (vt.value.children.length >= 1) {
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
    1
  );
  vt.value.children.push(newVT);
  await nextTick();
  focusedChat.chatTabsExpose?.add(topic);
};

const { isDragging, position } = useMouseDrag(
  dragger,
  {
    init: { x: 300, y: 0 },
  },
  {
    onTryDrag: (pos) => {
      const max = window.innerWidth / 3;
      const min = Math.min(max / 3, 100);
      if (pos.x > max) return { x: max };
      else if (pos.x > min) return pos;
      else return { x: min };
    },
  }
);

watchDebounced(
  () => position.value.x,
  () => (width.value = position.value.x),
  {
    debounce: 50,
    maxWait: 50,
  }
);

const { topics, updateTopic, removeTopic } = useTopics();
const tabsStore = chatTabsStore();
const focusedChat = focusedChatStore();
</script>
<style lang="css" scoped>
.nav-dragger {
  height: 100dvh;
  width: 10px;
  transform: translateX(-5px);
  top: 0px;

  user-select: none;
  cursor: col-resize;
  z-index: 999;
  position: fixed;
  transition: background-color 200ms ease;

  &.active,
  &:hover {
    background-color: rgba(var(--v-border-color), var(--v-border-opacity));
  }
}
</style>
