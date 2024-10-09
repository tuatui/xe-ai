<template>
  <VLayout>
    <XNav @add-chat-tab="handleAddChatTabs" />
    <VMain class="max-h-100dvh">
      <AdjustableView v-model="vt" />
    </VMain>
  </VLayout>
</template>
<script setup lang="tsx">
import { ChatTabs } from "#components";

const vt = ref(
  new ViewTree(
    false,
    undefined,
    false,
    [new ViewTree(true, (key) => <ChatTabs uniqueKey={key} />, false, [], 1)],
    1,
  ),
);
const tabsStore = chatTabsStore();
const focusedChat = focusedChatStore();
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
    1,
  );
  vt.value.children.push(newVT);
  await nextTick();
  focusedChat.chatTabsExpose?.add(topic);
};
</script>
