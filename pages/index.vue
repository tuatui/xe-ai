<template>
  <VLayout>
    <VNavigationDrawer disable-resize-watcher permanent :width="width">
      <VTextField clearable hide-details v-model="userInput">
        <template #append-inner>
          <VBtn
            icon="mdi-send"
            variant="text"
            @click="updateTopicHandle"
          ></VBtn>
        </template>
      </VTextField>
      <SettingDialog />
      <div
        ref="dragger"
        class="nav-dragger"
        :class="{ active: isDragging }"
        :style="{ left: `${position.x}px` }"
      ></div>
      <VList density="compact" nav>
        {{ isDragging }}{{ position }}
        <VListItem
          v-for="(item, i) in topics"
          @click="handleAddChatTabs(item)"
          :key="i"
          :value="item"
          :title="item.title || '无标题'"
          color="primary"
        />
      </VList>
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
    focusedChat.chatTabsExpose?.add(topic);
  } else {
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
  }
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

const userInput = ref("");
const { topics, updateTopic } = useTopics();
const updateTopicHandle = () => {
  updateTopic(userInput.value);
  userInput.value = "";
};
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
