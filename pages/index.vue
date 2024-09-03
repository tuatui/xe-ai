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
      <div ref="dragger" :style="style" class="nav-dragger"></div>
      <VList density="compact" nav>
        <VListItem
          v-for="(item, i) in topics"
          @click="focusedChat.chatTabsExpose?.add(item)"
          :key="i"
          :value="item"
          :title="item.title || '无标题'"
          color="primary"
        />
      </VList>
    </VNavigationDrawer>
    <VMain><AdjustableView :view-tree="vt" /></VMain>
  </VLayout>
</template>
<script setup lang="tsx">
import { ChatTabs } from "#components";
import { useDraggable } from "@vueuse/core";

const dragger = ref<HTMLElement | null>(null);
const width = ref(300);

const vt = {
  isVertical: false,
  children: [
    {
      isVertical: false,
      children: [],
      space: 0.5,
      isLeaf: true,
      view: <ChatTabs />,
    },
    {
      isVertical: false,
      children: [],
      space: 0.5,
      isLeaf: true,
      view: <ChatTabs />,
    },
  ],
  space: 1,
  isLeaf: false,
};

const { x, style } = useDraggable(dragger, {
  initialValue: { x: 300, y: 0 },
  preventDefault: true,
  axis: "x",
  containerElement: document?.body,
});
watchDebounced(x, () => (width.value = x.value), {
  debounce: 50,
  maxWait: 50,
});
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
  user-select: none;
  cursor: col-resize;
  z-index: 999;
  transform: translateX(-5px);
  /* background-color: red; */
  position: fixed;
}
</style>
