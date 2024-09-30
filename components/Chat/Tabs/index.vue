<template>
  <div
    class="flex flex-col h-full"
    @focus="handleClickChatTabs"
    tabindex="0"
    ref="divElem"
  >
    <VSheet
      class="!flex flex-row relative z-16 bg-primary"
      elevation="4"
      :class="{
        'tab-medium-emphasis': toRaw(focusedChat.chatTabsExpose) !== expose,
      }"
      @click="handleClickChatTabs"
    >
      <VTabs v-model="data.currTab" show-arrows class="grow min-w-0">
        <VTab
          :value="i.id"
          v-for="i in data.topics"
          :key="i.id"
          @click.middle.stop="remove(i)"
        >
          {{ i.title || untitledStr }}
          <template #append>
            <XCommonBtn
              variant="text"
              icon
              density="comfortable"
              size="small"
              @click.stop="remove(i)"
              use-icon="mdi-window-close"
              :use-tooltip="$t('common.close')"
            />
          </template>
        </VTab>
      </VTabs>
      <div class="flex-shrink-0 relative z-15">
        <template v-if="viewSize.inlineSize > 300">
          <ChatTabsBtnGroup
            @handle-new-chat="handleNewChat"
            @split-vert-handle="splitVertHandle"
            @split-horiz-handle="splitHorizHandle"
            @close="$emit('close')"
          />
        </template>
        <template v-else>
          <VMenu open-on-hover location="bottom end">
            <template v-slot:activator="{ props }">
              <VBtn
                icon="mdi-dots-vertical"
                variant="text"
                v-bind="props"
                :aria-label="$t('common.moreOptions')"
              />
            </template>
            <VList>
              <VListItem @click="handleNewChat">{{ $t("chat.new") }}</VListItem>
              <VListItem @click="splitVertHandle">{{
                $t("chat.splitRight")
              }}</VListItem>
              <VListItem @click="splitHorizHandle">{{
                $t("chat.splitDown")
              }}</VListItem>
              <VListItem @click="$emit('close')">{{
                $t("common.close")
              }}</VListItem>
            </VList>
          </VMenu>
        </template>
      </div>
    </VSheet>
    <VTabsWindow v-model="data.currTab" class="grow flex flex-col [&>*]:grow">
      <VTabsWindowItem
        :value="i.id"
        v-for="i in data.topics"
        :key="i.id"
        class="h-full"
      >
        <ChatView :topics="i" class="h-full" />
      </VTabsWindowItem>
      <VBtn
        v-if="data.topics.length === 0"
        class="ma"
        color="primary"
        prepend-icon="mdi-forum-plus"
        @click="handleNewChat"
      >
        {{ $t("chat.new") }}
      </VBtn>
    </VTabsWindow>
  </div>
</template>
<script setup lang="ts">
// 不能动态改动uniqueKey，有需要可以再创建新的组件实例
const { uniqueKey } = defineProps<{ uniqueKey: Symbol }>();
const store = chatTabsStore();
const divElem = ref<HTMLDivElement>();
const untitledStr = useT("chat.untitled");
const data =
  store.globalSharedTabs.get(uniqueKey) ||
  ref<{
    topics: TopicData[];
    currTab: number | undefined;
    expose?: ChatTabsExpose;
  }>({ topics: [], currTab: undefined });

if (!store.globalSharedTabs.has(uniqueKey))
  store.globalSharedTabs.set(uniqueKey, data);

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

const add = (topic: TopicData): void => {
  const i = data.value.topics.findIndex((v) => v.id === topic.id);
  if (i < 0) data.value.topics.push(topic);
  data.value.currTab = topic.id;
};
const expose: ChatTabsExpose = {
  add,
  getAll: () => data.value.topics,
  getCurr: () => data.value.topics.find((v) => v.id === data.value.currTab),
};

onMounted(() => {
  const lastFocusTopic = focusedChat.chatTabsExpose?.getCurr();
  if (lastFocusTopic) expose.add(lastFocusTopic);
  handleClickChatTabs();
  data.value.expose = expose;
});
onUnmounted(() => {
  if (toRaw(focusedChat.chatTabsExpose) === expose)
    focusedChat.chatTabsExpose = undefined;
});
defineExpose(expose);

const { pushNotification } = notificationStore();
const { t } = useI18n();

let canShow = true;
const showWarn = () => {
  if (!canShow) return;
  canShow = false;
  pushNotification({
    content: t("common.notEnoughSpace"),
    onFinish: () => (canShow = true),
  });
};

const emit = defineEmits<{
  splitHorizontal: [];
  splitVertical: [];
  close: [];
}>();
const splitVertHandle = () => {
  if (!divElem.value) return;
  if (divElem.value.offsetWidth > 256) emit("splitVertical");
  else showWarn();
};

const splitHorizHandle = () => {
  if (!divElem.value) return;
  if (divElem.value.offsetHeight > 256) emit("splitHorizontal");
  else showWarn();
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
const ts = topicStore();
const handleNewChat = async () => {
  const res = await ts.updateTopic("");
  if (!res) return;
  const newTopic = ts.topics.at(-1);
  if (newTopic) add(newTopic);
};
</script>
<style lang="css" scoped>
.tab-medium-emphasis {
  color: rgb(
    var(--v-theme-on-primary),
    var(--v-medium-emphasis-opacity)
  ) !important;
}
</style>
