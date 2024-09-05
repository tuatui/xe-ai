<template>
  <div
    class="flex flex-col h-full tabs-focus"
    @focus="handleClickChatTabs"
    tabindex="0"
    ref="divElem"
  >
    <div class="flex">
      <VTabs
        v-model="data.currTab"
        bg-color="primary"
        show-arrows
        class="grow min-w-0"
      >
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
      <div class="bg-primary flex-shrink-0">
        <template v-if="viewSize.inlineSize > 300">
          <VBtn
            icon="mdi-view-split-vertical"
            variant="text"
            @click="splitVertHandle"
          /><VBtn
            icon="mdi-view-split-horizontal"
            variant="text"
            @click="splitHorizHandle"
          /><VBtn icon="mdi-close" variant="text" @click="$emit('close')" />
        </template>
        <template v-else>
          <VMenu open-on-hover>
            <template v-slot:activator="{ props }">
              <VBtn
                icon="mdi-dots-vertical"
                variant="text"
                v-bind="props"
              ></VBtn>
            </template>
            <VList>
              <VListItem>
                <VBtn
                  icon="mdi-view-split-vertical"
                  variant="text"
                  @click="splitVertHandle"
                /><VBtn
                  icon="mdi-view-split-horizontal"
                  variant="text"
                  @click="splitHorizHandle"
                /><VBtn
                  icon="mdi-close"
                  variant="text"
                  @click="$emit('close')"
                />
              </VListItem>
            </VList>
          </VMenu>
        </template>
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
const divElem = ref<HTMLDivElement>();

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
onMounted(handleClickChatTabs)
const expose = {
  add: (topic: TopicData) => {
    const i = data.value.topics.findIndex((v) => v.id === topic.id);
    if (i < 0) data.value.topics.push(topic);
    else data.value.currTab = i;
  },
};

defineExpose(expose);

const emit = defineEmits<{
  splitHorizontal: [];
  splitVertical: [];
  close: [];
}>();
const splitVertHandle = () => {
  if (!divElem.value) return;
  if (divElem.value.offsetWidth > 256) emit("splitVertical");
  else alert("hahhaa");
};

const splitHorizHandle = () => {
  if (!divElem.value) return;
  if (divElem.value.offsetHeight > 256) emit("splitHorizontal");
  else alert("hahhaa");
};

const viewSize = ref<ResizeObserverSize>({ blockSize: 500, inlineSize: 500 });
if (import.meta.client) {
  const resizeObs = new ResizeObserver((entries) => {
    const size = entries[0]?.contentBoxSize[0];
    if (size) viewSize.value = size;
  });
  onMounted(() => divElem.value && resizeObs.observe(divElem.value));
  onUnmounted(() => resizeObs.disconnect());
}
</script>
<!-- <style lang="css" scoped>
.tabs-focus:focus{
  outline: 0.2rem solid rgb(var(--v-theme-secondary));
  outline-offset: -0.2rem;
} 
</style> -->
