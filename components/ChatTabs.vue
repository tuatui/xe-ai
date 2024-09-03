<template>
  <div
    class="flex flex-col h-full tabs-focus"
    @focus="handleClickChatTabs"
    tabindex="0"
  >
    <VTabs v-model="currTab" bg-color="primary" show-arrows>
      <VTab :value="i.id" v-for="i in topics" :key="i.id">
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
    <VTabsWindow v-model="currTab" class="grow flex flex-col [&>*]:grow">
      <VTabsWindowItem
        :value="i.id"
        v-for="i in topics"
        :key="i.id"
        class="h-full"
      >
        <ChatView :topic-i-d="i.id" class="h-full" />
      </VTabsWindowItem>
    </VTabsWindow>
  </div>
</template>
<script setup lang="ts">
const topics = ref<TopicData[]>([]);
const currTab = ref<number>();

let lastTopicsLen = topics.value.length;
watch(
  () => topics.value,
  () => {
    if (topics.value.length > lastTopicsLen)
      currTab.value = topics.value.at(-1)?.id;
    lastTopicsLen = topics.value.length;
  },
  { deep: true }
);
const remove = (topic: TopicData) => {
  const i = topics.value.indexOf(topic);
  if (i < 0) return;
  topics.value.splice(i, 1);
  if (topic.id === currTab.value && topics.value.length > 0)
    currTab.value = topics.value[Math.max(i - 1, 0)].id;
};

const focusedChat = focusedChatStore();
const handleClickChatTabs = () => (focusedChat.chatTabsExpose = expose);
const expose = {
  add: (topic: TopicData) => {
    const i = topics.value.findIndex((v) => v.id === topic.id);
    if (i < 0) topics.value.push(topic);
    else currTab.value = i;
  },
};
defineExpose(expose);
</script>
<!-- <style lang="css" scoped>
.tabs-focus:focus{
  outline: 0.2rem solid rgb(var(--v-theme-secondary));
  outline-offset: -0.2rem;
} 
</style> -->
