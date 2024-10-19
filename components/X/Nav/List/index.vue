<template>
  <VList
    class="grow box-border overflow-auto bg-surface-light !pt0 contain-strict"
    :aria-label="$L.aria.chatHistory"
  >
    <div v-for="([timeStr, topicList], i) in relativeTimeTopic" :key="timeStr">
      <VDivider v-if="i > 0" role="none" />
      <div class="sticky top-0 z-1 bg-surface-light">
        <VListSubheader>{{ timeStr }}</VListSubheader>
      </div>
      <VListItem
        role="option"
        v-for="(topic, i) in topicList"
        @click="$emit('addChat', topic)"
        :key="topic.id"
        color="primary"
        draggable="true"
        @dragstart="
          (ev: DragEvent) => {
            dragTooltipText = topic.title || $L.chat.untitled;
            dragAndDropChat.setData(ev, { topic }, { el: dragTooltip });
          }
        "
      >
        <XNavListItem
          :value="topic.title || $L.chat.untitled"
          @remove="handleRemoveTopic(topicList, i)"
          @update="(v) => handleUpdateTopic(v, topic)"
        />
      </VListItem>
    </div>
    <Teleport to="body">
      <div class="fixed right-0">
        <div ref="dragTooltip" class="bg-surface-light rounded px4 py1">
          {{ dragTooltipText }}
        </div>
      </div>
    </Teleport>
  </VList>
</template>
<script setup lang="ts">
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
const dragTooltip = ref<HTMLDivElement>();
const dragTooltipText = ref("");
const locale = ref("zh");

const tabsStore = chatTabsStore();
defineEmits<{
  addChat: [item: TopicData];
  newTopicWithChat: [];
}>();

const ts = topicStore();
const { pushNotification } = notificationStore();
const { updateTopic, removeTopic, updateCache } = ts;
const { $L } = useNuxtApp();
let jobCount = 0;
const handleRemoveTopic = (topicsInMap: TopicData[], index: number) => {
  const [topic] = topicsInMap.splice(index, 1);

  (async () => {
    jobCount++;
    await new Promise<void>((resolve) => {
      pushNotification({
        content: $L.action.deleteSome(topic.title || $L.chat.untitled),
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
