<template>
  <div
    class="flex flex-col h-full tabs-focus"
    @focus="handleClickChatTabs"
    tabindex="0"
  >
    <div class="flex">
      <VTabs v-model="data.currTab" bg-color="primary" show-arrows class="grow">
        <VTab :value="i.id" v-for="i in data.topics" :key="i.id">
          {{ i.title }}
          <template #append>
            <VBtn
              variant="text"
              icon="mdi-window-close"
              density="comfortable"
              size="small"
              @click.stop="remove(i)"
            />
          </template>
        </VTab>
      </VTabs>
      <div class="bg-primary">
        <VBtn
          icon="mdi-view-split-horizontal"
          variant="text"
          @click="$emit('splitHorizontal')"
        />
        <VBtn
          icon="mdi-view-split-vertical"
          variant="text"
          @click="$emit('splitVertical')"
        />
        <VBtn icon="mdi-close" variant="text" @click="$emit('close')" />
      </div>
    </div>
    <VTabsWindow v-model="data.currTab" class="grow flex flex-col [&>*]:grow">
      <VTabsWindowItem
        :value="i.id"
        v-for="i in data.topics"
        :key="i.id"
        class="h-full"
      >
        <ChatView :topic-i-d="i.id" class="h-full" />
      </VTabsWindowItem>
    </VTabsWindow>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ uniqueKey: Symbol }>();
const store = chatTabsStore();

const data =
  store.globalSharedTabs.get(props.uniqueKey) ||
  ref<{
    topics: TopicData[];
    currTab: number | undefined;
  }>({ topics: [], currTab: undefined });

if (!store.globalSharedTabs.has(props.uniqueKey))
  store.globalSharedTabs.set(props.uniqueKey, data);

watch(
  () => data.value.topics.length,
  (newVal, oldVal) => {
    if (newVal > oldVal) data.value.currTab = data.value.topics.at(-1)?.id;
  }
);
const remove = (topic: TopicData) => {
  const i = data.value.topics.indexOf(topic);
  if (i < 0) return;
  data.value.topics.splice(i, 1);
  if (topic.id === data.value.currTab && data.value.topics.length > 0)
    data.value.currTab = data.value.topics[Math.max(i - 1, 0)].id;
};

const focusedChat = focusedChatStore();
const handleClickChatTabs = () => (focusedChat.chatTabsExpose = expose);
const expose = {
  add: (topic: TopicData) => {
    const i = data.value.topics.findIndex((v) => v.id === topic.id);
    if (i < 0) data.value.topics.push(topic);
    else data.value.currTab = i;
  },
};
defineExpose(expose);

defineEmits<{
  splitHorizontal: [];
  splitVertical: [];
  close: [];
}>();
</script>
<!-- <style lang="css" scoped>
.tabs-focus:focus{
  outline: 0.2rem solid rgb(var(--v-theme-secondary));
  outline-offset: -0.2rem;
} 
</style> -->
