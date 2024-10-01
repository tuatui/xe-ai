<template>
  <VList
    class="grow min-h-0 overflow-auto"
    :aria-label="$t('aria.chatHistory')"
  >
    <template v-for="[timeStr, topicList] in relativeTimeTopic">
      <VListSubheader>{{ timeStr }}</VListSubheader>
      <VListItem
        role="option"
        v-for="(item, i) in topicList"
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
    </template>
  </VList>
</template>
<script setup lang="ts">
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const untitledStr = useT("chat.untitled");
const ts = topicStore();
const tabsStore = chatTabsStore();
defineEmits<{
  addChat: [item: TopicData];
}>();

const { pushNotification } = notificationStore();
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

const { locale } = useI18n();
const topics = computed(() => ts.topics);

const relativeTimeTopic = computed(() => {
  dayjs.locale(locale.value);

  const map = new Map<string, TopicData[]>();
  topics.value.forEach((each) => {
    const res = map.get(dayjs(each.updateTime).fromNow());
    if (res) res.push(each);
    else map.set(dayjs(each.updateTime).fromNow(), [each]);
  });

  return map;
});
</script>
