<template>
  <VLayout>
    <VNavigationDrawer
      disable-resize-watcher
      permanent
      :width="width"
      :aria-label="$t('aria.sideNav')"
    >
      <div class="h-full w-full flex flex-col">
        <NavList
          @add-chat="handleAddChatTabs"
          @new-topic-with-chat="handleAddTopic"
        />
        <VDivider />
        <div class="flex gap1">
          <Setting />
          <I18nSwitch />
          <ThemeSwitch />
          <SettingUser />
        </div>
      </div>
      <BottomSnackBar />
    </VNavigationDrawer>
    <VMain class="max-h-100dvh">
      <AdjustableView v-model="vt" />
    </VMain>
    <NavListResizer v-model="width" />
  </VLayout>
</template>
<script setup lang="tsx">
import { ChatTabs } from "#components";
const width = ref(205);

const vt = ref(
  new ViewTree(
    false,
    undefined,
    false,
    [new ViewTree(true, (key) => <ChatTabs uniqueKey={key} />, false, [], 1)],
    1
  )
);
const { updateTopic, getTopicData } = topicStore();
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
    1
  );
  vt.value.children.push(newVT);
  await nextTick();
  focusedChat.chatTabsExpose?.add(topic);
};

const handleAddTopic = async () => {
  const newTopic = { title: "" };
  const res = await updateTopic(newTopic);

  handleAddChatTabs(res);
};
</script>
<style lang="scss" scoped>
@use "/assets/tab.scss" as *;
.dragger {
  @include dragger-base();
}
</style>
