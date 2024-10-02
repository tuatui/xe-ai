<template>
  <VList
    class="flex flex-col grow min-h-0"
    :aria-label="$t('aria.chatHistory')"
  >
    <VListItem lines="two">
      <VBtn
        variant="tonal"
        prepend-icon="mdi-plus"
        @click="$emit('newTopicWithChat')"
        >开始新对话</VBtn
      >
    </VListItem>
    <div class="grow min-h-0 overflow-auto relative">
      <template v-for="[timeStr, topicList] in relativeTimeTopic">
        <div class="sticky top-0 z-10 bg-surface">
          <VDivider />
          <VListSubheader>{{ timeStr }}</VListSubheader>
        </div>

        <VListItem
          role="option"
          v-for="(item, i) in topicList"
          @click="$emit('addChat', item)"
          :key="item.id"
          color="primary"
        >
          <NavListItem
            :value="item.title || untitledStr"
            @remove="handleRemoveTopic(topicList, i)"
            @update="(v) => handleUpdateTopic(v, item.id)"
          />
        </VListItem>
      </template>
    </div>
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
  newTopicWithChat: [];
}>();

const { pushNotification } = notificationStore();
const { updateTopic, removeTopic, updateCache } = ts;
const topics = computed(() => ts.topics);
const { locale } = useI18n();

let jobCount = 0;
const handleRemoveTopic = (topicsInMap: TopicData[], index: number) => {
  const [topic] = topicsInMap.splice(index, 1);

  (async () => {
    jobCount++;
    await new Promise<void>((resolve) => {
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
          resolve();
        },
        onCancel: () => {
          topicsInMap.splice(index, 0, topic);
          resolve();
        },
      });
    });
    jobCount--;
    if (jobCount === 0) updateCache();
  })();
};

const handleUpdateTopic = async (title: string, topicID: number) => {
  await updateTopic({ title, id: topicID });
  tabsStore.globalSharedTabs.forEach((each) => {
    const res = each.value.topics.find((topic) => topic.id == topicID);
    if (res) res.title = title;
  });
};

const relativeTimeTopic = ref<Map<string, TopicData[]>>(new Map());
watch([locale, topics], () => {
  dayjs.locale(locale.value);
  const map = new Map<string, TopicData[]>();
  topics.value.forEach((each) => {
    const res = map.get(dayjs(each.updateTime).fromNow());
    if (res) res.push(each);
    else map.set(dayjs(each.updateTime).fromNow(), [each]);
  });
  relativeTimeTopic.value = map;
});
</script>
