<template>
  <div
    class="flex flex-col h-full"
    @focusin="handleClickChatTabs"
    tabindex="0"
    ref="tabRootEl"
  >
    <div
      class="flex flex-row"
      :class="{
        'text-medium-emphasis': toRaw(focusedChat.chatTabsExpose) !== expose,
      }"
    >
      <VTabs
        v-model="data.currTab"
        color="primary"
        class="grow min-w-0 [&+.v-window]:shrink-0"
        :show-arrows="viewSize.inlineSize > 400 ? undefined : `desktop`"
        :mobile-breakpoint="viewSize.inlineSize > 400 ? undefined : 9999"
      >
        <VTab
          class="!normal-case"
          :value="i.id"
          v-for="i in data.topics"
          :key="i.id"
          @mousedown.middle.prevent
          @click.middle.prevent="remove(i)"
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
              @mousedown.prevent
              @click.stop="remove(i)"
              use-icon="i-mdi-window-close"
              :use-tooltip="$L.common.close"
            />
          </template>
        </VTab>
        <template #window>
          <div>
            <XCommonBtn
              v-if="data.isCollapse"
              icon
              variant="text"
              @click.stop="data.isCollapse = false"
              use-icon="i-mdi-chevron-up"
              :use-tooltip="$L.chat.noCollapse"
            />
            <template v-if="viewSize.inlineSize > 500">
              <ChatTabsBtnGroup
                @handle-new-chat="handleNewChat"
                @split-vert-handle="handleSplit(false, true)"
                @split-horiz-handle="handleSplit(true, true)"
                @close="handleClose"
              />
            </template>
            <template v-else>
              <VMenu location="bottom end" open-on-focus open-on-click>
                <template v-slot:activator="{ props }">
                  <VBtn
                    icon="i-mdi-dots-vertical"
                    variant="text"
                    v-bind="props"
                    :title="$L.common.moreOptions"
                    :aria-label="$L.common.moreOptions"
                  />
                </template>
                <VList>
                  <VListItem @click="handleNewChat">{{
                    $L.chat.new
                  }}</VListItem>
                  <VListItem @click="handleSplit(false, true)">{{
                    $L.chat.splitRight
                  }}</VListItem>
                  <VListItem @click="handleSplit(true, true)">{{
                    $L.chat.splitDown
                  }}</VListItem>
                  <VListItem @click="handleClose">{{
                    $L.common.close
                  }}</VListItem>
                </VList>
              </VMenu>
            </template>
          </div>
        </template>
      </VTabs>
    </div>
    <VDivider />
    <div
      ref="dropZone"
      class="grow relative box-border overflow-hidden flex"
      @dragover.prevent="(e) => (handleDragOver(e), handleDragStatus())"
      @drop="handleDropEnd"
    >
      <VTabsWindow
        v-model="data.currTab"
        class="grow flex [&>*]:grow [&>*]:min-w0"
      >
        <VTabsWindowItem
          :value="i.id"
          v-for="(i, index) in data.topics"
          :key="i.id"
          class="h-full"
          :class="{ '[&_*]:pointer-events-none': isDragging }"
        >
          <ChatView
            :topics="i"
            class="h-full"
            v-model="data.isCollapse"
            v-model:input-height="data.inputHeight"
            @close="data.topics.splice(index, 1)"
            @update-title="(n) => (i.title = n)"
          />
        </VTabsWindowItem>
        <Transition>
          <div
            v-if="isDragging"
            class="bg-secondary drag-overlay"
            :class="{ [dragOverlayType]: true }"
          ></div>
        </Transition>
      </VTabsWindow>
    </div>
  </div>
</template>
<script setup lang="tsx">
import { ChatTabs } from "#components";
import { LeafType } from "~/stores/chatTree";
import type { LeafComponentProps } from "~/types/adjustableView";

// 未来的设计中，父组件最好不要动态改动uniqueKey，可以再创建新的组件实例
const { uniqueKey, cutLeaf, splitLeaf } = defineProps<LeafComponentProps>();
const { globalSharedTabs: globalTabs } = chatTabsStore();
const tabRootEl = ref<HTMLDivElement>();

const data =
  globalTabs.get(uniqueKey) ||
  ref<ChatTabsData>({ topics: [], currTab: undefined, type: LeafType.tabs });

if (!globalTabs.has(uniqueKey)) globalTabs.set(uniqueKey, data);

const handleSplit = (
  isVertical: boolean,
  clone = false,
  onLeftSide = false,
) => {
  if (!splitLeaf) return;
  if (!tabRootEl.value) return;
  if (isVertical && tabRootEl.value.offsetHeight < 256) {
    showWarn();
    return;
  }
  if (!isVertical && tabRootEl.value.offsetWidth < 256) {
    showWarn();
    return;
  }
  const newTab = splitLeaf(isVertical, ChatTabs, onLeftSide);
  const curr = expose.getCurr();
  if (newTab && curr && clone)
    nextTick().then(() => globalTabs.get(newTab)?.value.expose?.add(curr));
  return newTab;
};
const handleClose = () => {
  if (!cutLeaf) return;
  const res = cutLeaf();
  globalTabs.delete(res);
};

const isDragging = ref(false);
let lastDragOver = () => {};
const handleDragStatus = async () => {
  lastDragOver();
  isDragging.value = true;
  const res = await new Promise<void>((resolve, reject) => {
    lastDragOver = reject;
    setTimeout(resolve, 100); // 或许 >=350ms ?
  }).catch(() => 1);
  if (res === 1) return;
  isDragging.value = false;
};
const handleDropEnd = (ev: DragEvent) => {
  isDragging.value = false;
  const res = dragAndDropChat.getData(ev);
  if (!res) return;
  const el = dropZone.value;
  if (!el) return;

  const oType = calcMousePos(el.getBoundingClientRect(), ev);
  let splitRes: symbol | undefined;

  if (oType === "right") splitRes = handleSplit(false);
  else if (oType === "left") splitRes = handleSplit(false, false, true);
  else if (oType === "bottom") splitRes = handleSplit(true);
  else if (oType === "top") splitRes = handleSplit(true, false, true);
  else add(res.topic);

  if (splitRes)
    nextTick().then(() => {
      const tab = globalTabs.get(splitRes)?.value;
      if (!tab) {
        console.warn("找不到新增的tab");
        return;
      }
      tab.expose?.add(res.topic);
      if (ev.ctrlKey) tab.isCollapse = true;
    });

  if (
    res.isMove &&
    (res.isMove.fromTab !== uniqueKey || (splitRes && oType !== "full")) &&
    !ev.altKey
  ) {
    globalTabs.get(res.isMove.fromTab)?.value.expose?.remove(res.topic);
  }
};

const remove = (topic: TopicData) => {
  const i = data.value.topics.indexOf(topic);
  if (i < 0) return;
  data.value.topics.splice(i, 1);
  if (topic.id === data.value.currTab && data.value.topics.length > 0)
    data.value.currTab = data.value.topics[Math.max(i - 1, 0)].id;
};

const focusedChat = focusedChatStore();
const handleClickChatTabs = () => (focusedChat.chatTabsExpose = expose);
onMounted(handleClickChatTabs);

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
data.value.expose = expose;

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

type OverlayType = "full" | "left" | "right" | "top" | "bottom";
const dragOverlayType = ref<OverlayType>("full");

const dropZone = ref<HTMLDivElement>();
const calcMousePos = (rect: DOMRect, ev: DragEvent): OverlayType => {
  const { left, right, top, bottom } = rect;
  const { pageX, pageY } = ev;
  const offsetX = (right - left) * 0.12;
  const offsetY = (bottom - top) * 0.12;
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

let slideEl: HTMLDivElement | undefined | null = null;
const mapVerScrollToHor = (e: WheelEvent) => {
  if (!e.deltaY || !slideEl) return;
  slideEl.scrollLeft += e.deltaY;
};
onMounted(() => {
  // TODO: 或许我们应该自制一个XTabs以取代VTabs
  slideEl = tabRootEl.value?.querySelector(".v-slide-group__container");
  slideEl?.addEventListener("wheel", mapVerScrollToHor, { passive: true });
});
onUnmounted(() => {
  slideEl?.removeEventListener("wheel", mapVerScrollToHor);
  slideEl = null;
});
</script>
<style lang="scss" scoped>
.drag-overlay {
  position: absolute;
  opacity: 0.3;
  pointer-events: none;
  transition: 140ms ease;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  &.full {
    transform: scale(1);
  }
  &.left {
    transform: scaleX(0.5) translateX(-50%);
  }
  &.right {
    transform: scaleX(0.5) translateX(50%);
  }
  &.top {
    transform: scaleY(0.5) translateY(-50%);
  }
  &.bottom {
    transform: scaleY(0.5) translateY(50%);
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
