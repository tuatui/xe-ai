<template>
  <VList
    class="flex flex-col grow min-h-0 bg-surface-light !py0"
    :aria-label="$t('aria.chatHistory')"
  >
    <VListItem lines="two" :class="{ '!px1 !py2': rail }">
      <XCommonBtn
        :icon="rail"
        use-icon="mdi-plus"
        role="option"
        variant="tonal"
        @click="$emit('newTopicWithChat')"
        use-tooltip="开始新对话"
        tooltip-location="right center"
        :embed-tooltip="!rail"
      />
    </VListItem>
    <VDivider role="none" />
    <VSpacer v-show="rail" />
    <div
      v-show="!rail"
      class="grow min-h-0 overflow-auto relative pb2 bg-inherit"
    >
      <template
        v-for="([timeStr, topicList], i) in relativeTimeTopic"
        :key="timeStr"
      >
        <div class="sticky top-0 z-10 bg-inherit">
          <!-- <VDivider role="none" v-if="i !== 0" /> -->
          <VListSubheader>{{ timeStr }}</VListSubheader>
        </div>

        <VListItem
          role="option"
          v-for="(topic, i) in topicList"
          @click="$emit('addChat', topic)"
          :key="topic.id"
          color="primary"
        >
          <XNavListItem
            :value="topic.title || untitledStr"
            @remove="handleRemoveTopic(topicList, i)"
            @update="(v) => handleUpdateTopic(v, topic)"
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
defineProps<{ rail: boolean }>();
const untitledStr = useT("chat.untitled");
const { locale } = useI18n();

const tabsStore = chatTabsStore();
defineEmits<{
  addChat: [item: TopicData];
  newTopicWithChat: [];
}>();

const ts = topicStore();
const { pushNotification } = notificationStore();
const { updateTopic, removeTopic, updateCache } = ts;

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
          removeTopic(topic.id, false);
          tabsStore.globalSharedTabs.forEach((each) => {
            const res = each.value.topics.findIndex(
              (_topic) => _topic.id == topic.id,
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

const handleUpdateTopic = async (title: string, topic: TopicData) => {
  topic.title = title;
  await updateTopic({ title, id: topic.id }, false);
  tabsStore.globalSharedTabs.forEach((each) => {
    const res = each.value.topics.find((_topic) => _topic.id == topic.id);
    if (res) res.title = title;
  });

  const res = ts.topics.find((_topic) => _topic.id === topic.id);
  if (res) res.title = title;
};

const relativeTimeTopic = ref<Map<string, TopicData[]>>(new Map());

const { topics } = storeToRefs(ts);
watch(
  [locale, topics],
  () => {
    dayjs.locale(locale.value);
    const map = new Map<string, TopicData[]>();
    topics.value.forEach((each) => {
      const res = map.get(dayjs(each.updateTime).fromNow());
      if (res) res.push(each);
      else map.set(dayjs(each.updateTime).fromNow(), [each]);
    });
    relativeTimeTopic.value = map;
  },
  { deep: true, immediate: true },
);
</script>
