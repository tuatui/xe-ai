<template>
  <VList
    class="grow min-h-0 overflow-auto"
    :aria-label="$t('aria.chatHistory')"
  >
    <VListItem
      role="option"
      v-for="(item, i) in topics"
      @click="$emit('addChat', item)"
      :key="item.id"
      color="primary"
    >
      <NavListItem
        :value="item.title || untitledStr"
        @remove="handleRemoveTopic(item, i)"
        @update="(v) => handleUpdateTopic(v, item.id)"
      />
    </VListItem>
  </VList>
</template>
<script setup lang="ts">
const untitledStr = useT("chat.untitled");
const ts = topicStore();
const tabsStore = chatTabsStore();
defineEmits<{
  addChat: [item: TopicData];
}>();

const { pushNotification } = notificationStore();

const topics = computed(() => ts.topics);
const { updateTopic, removeTopic } = ts;

const handleRemoveTopic = (topic: TopicData, index: number) => {
  ts.topics.splice(index, 1);
  pushNotification({
    content: `已删除 "${topic.title || "无标题"}"`,
    cancelable: true,
    onFinish: () => {
      removeTopic(topic.id);
      tabsStore.globalSharedTabs.forEach((each) => {
        const res = each.value.topics.findIndex(
          (_topic) => _topic.id == topic.id
        );
        if (res >= 0) each.value.topics.splice(res, 1);
      });
    },
    onCancel: () => ts.topics.splice(index, 0, topic),
  });
};

const handleUpdateTopic = async (title: string, topicID: number) => {
  await updateTopic({ title, id: topicID });
  tabsStore.globalSharedTabs.forEach((each) => {
    const res = each.value.topics.find((topic) => topic.id == topicID);
    if (res) res.title = title;
  });
};
</script>
