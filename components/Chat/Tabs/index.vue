<template>
  <div
    class="flex flex-col h-full"
    @focusin="handleClickChatTabs"
    tabindex="0"
    ref="tabRootEl"
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
          class="bg-primary"
          :value="i.id"
          v-for="i in data.topics"
          :key="i.id"
          @click.middle.stop="remove(i)"
          draggable="true"
          @dragstart="
            (ev: DragEvent) =>
              dragAndDropChat.setData(
                ev,
                {
                  topic: i,
                  isMove: { fromTab: uniqueKey },
                },
                { effect: 'move' },
              )
          "
        >
          {{ i.title || $L.chat.untitled }}
          <template #append>
            <XCommonBtn
              variant="text"
              icon
              density="comfortable"
              size="small"
              @click.stop="remove(i)"
              use-icon="i-mdi-window-close"
              :use-tooltip="$L.common.close"
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
                icon="i-mdi-dots-vertical"
                variant="text"
                v-bind="props"
                :aria-label="$L.common.moreOptions"
              />
            </template>
            <VList>
              <VListItem @click="handleNewChat">{{ $L.chat.new }}</VListItem>
              <VListItem @click="splitVertHandle">{{
                $L.chat.splitRight
              }}</VListItem>
              <VListItem @click="splitHorizHandle">{{
                $L.chat.splitDown
              }}</VListItem>
              <VListItem @click="$emit('close')">{{
                $L.common.close
              }}</VListItem>
            </VList>
          </VMenu>
        </template>
      </div>
    </VSheet>
    <div
      ref="dropZone"
      class="grow relative box-border"
      @dragover.prevent="handleDragOver"
      @dragenter="dragCount++"
      @dragleave="dragCount--"
      @drop="handleDropEnd"
    >
      <VTabsWindow v-model="data.currTab" class="h-full w-full">
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
          prepend-icon="i-mdi-forum-plus"
          @click="handleNewChat"
        >
          {{ $L.chat.new }}
        </VBtn>
        <Transition>
          <div
            v-if="dragCount"
            class="bg-secondary drag-overlay"
            :class="{ [dragOverlayType]: true }"
          ></div>
        </Transition>
      </VTabsWindow>
    </div>
  </div>
</template>
<script setup lang="ts">
// 不能动态改动uniqueKey，有需要可以再创建新的组件实例
const { uniqueKey } = defineProps<{ uniqueKey: symbol }>();
const store = chatTabsStore();
const tabRootEl = ref<HTMLDivElement>();

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
  },
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
  remove,
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
const { $L } = useNuxtApp();

const showWarn = () => {
  pushNotification({
    content: $L.common.notEnoughSpace,
    allowClose: false,
    timeout: 3000,
  });
};

const emit = defineEmits<{
  splitHorizontal: [];
  splitVertical: [];
  close: [];
}>();
const splitVertHandle = () => {
  if (!tabRootEl.value) return;
  if (tabRootEl.value.offsetWidth > 256) emit("splitVertical");
  else showWarn();
};

const splitHorizHandle = () => {
  if (!tabRootEl.value) return;
  if (tabRootEl.value.offsetHeight > 256) emit("splitHorizontal");
  else showWarn();
};

const viewSize = ref<ResizeObserverSize>({ blockSize: 500, inlineSize: 500 });
if (import.meta.client) {
  const resizeObs = new ResizeObserver((entries) => {
    const size = entries[0]?.contentBoxSize[0];
    if (size) viewSize.value = size;
  });
  onMounted(() => tabRootEl.value && resizeObs.observe(tabRootEl.value));
  onUnmounted(() => resizeObs.disconnect());
}
const ts = topicStore();
const handleNewChat = async () => {
  const res = await ts.updateTopic({ title: "" });
  if (!res) return;
  const newTopic = ts.topics.find((topic) => topic.id === res.id);
  if (newTopic) add(newTopic);
};

const dragCount = ref(0);

const handleDropEnd = (ev: DragEvent) => {
  dragCount.value--;
  const res = dragAndDropChat.getData(ev);
  if (!res) return;
  const el = dropZone.value;
  if (!el) return;
  const oType = calcMousePos(el.getBoundingClientRect(), ev);
  add(res.topic);
  if (oType === "left" || oType === "right") splitVertHandle();
  else if (oType === "bottom" || oType === "top") splitHorizHandle();

  if (res.isMove && res.isMove.fromTab !== uniqueKey)
    store.globalSharedTabs
      .get(res.isMove.fromTab)
      ?.value.expose?.remove(res.topic);
};
type OverlayType = "full" | "left" | "right" | "top" | "bottom";
const dragOverlayType = ref<OverlayType>("full");

const dropZone = ref<HTMLDivElement>();
const calcMousePos = (rect: DOMRect, ev: DragEvent): OverlayType => {
  const { left, right, top, bottom } = rect;
  const { pageX, pageY } = ev;
  const offsetX = (right - left) * 0.2;
  const offsetY = (right - left) * 0.2;
  if (pageX < left + offsetX) return "left";
  else if (pageX > right - offsetX) return "right";
  else if (pageY < top + offsetY) return "top";
  else if (pageY > bottom - offsetY) return "bottom";
  else return "full";
};
const handleDragOver = (ev: DragEvent) => {
  const el = dropZone.value;
  if (!el) return;
  dragOverlayType.value = calcMousePos(el.getBoundingClientRect(), ev);
};
</script>
<style lang="scss" scoped>
.tab-medium-emphasis {
  color: rgb(
    var(--v-theme-on-primary),
    var(--v-medium-emphasis-opacity)
  ) !important;
}
.drag-overlay {
  position: absolute;
  opacity: 0.3;
  pointer-events: none;
  transition: 200ms;
  top: 0;
  left: 0;
  &.full {
    width: 100%;
    height: 100%;
  }
  &.left {
    width: 50%;
    height: 100%;
  }
  &.right {
    left: 50%;
    width: 50%;
    height: 100%;
  }
  &.top {
    width: 100%;
    height: 50%;
  }
  &.bottom {
    top: 50%;
    width: 100%;
    height: 50%;
  }
}
.v-enter-active,
.v-leave-active {
  transition: opacity 200ms ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
