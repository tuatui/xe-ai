<template>
  <VLayout>
    <VNavigationDrawer disable-resize-watcher permanent :width="width">
      <div class="h-full w-full flex flex-col">
        <VList class="grow min-h-0 overflow-auto">
          <VListItem
            v-for="item in topics"
            @click="handleAddChatTabs(item)"
            :key="item.id"
            color="primary"
          >
            <NavListItem
              :value="item.title || $t('chat.untitled')"
              @remove="removeTopic(item.id)"
              @update="(v) => handleUpdateTopic(v, item.id)"
            />
          </VListItem>
        </VList>
        <VDivider />
        <div class="flex gap1">
          <SettingDialog />
          <VMenu>
            <template v-slot:activator="{ props }" r>
              <VBtn icon="mdi-translate" v-bind="props" variant="text" />
            </template>
            <VList nav width="150">
              <VListItem
                density="compact"
                v-for="(item, i) in locales"
                :variant="locale === item.code ? `tonal` : undefined"
                :key="i"
                :title="item.name"
                @click="setLocale(item.code)"
              >
              </VListItem>
            </VList>
          </VMenu>
        </div>
      </div>
      <div
        ref="dragger"
        class="dragger offset-x top-0px fixed h-100dvh cursor-col-resize"
        :class="{ active: isDragging }"
        :style="{ left: `${position.x}px` }"
      ></div>
    </VNavigationDrawer>
    <VMain>
      <AdjustableView v-model="vt" />
    </VMain>
  </VLayout>
</template>
<script setup lang="tsx">
const { setLocale, locales, locale } = useI18n();
import { ChatTabs } from "#components";
const dragger = ref<HTMLElement | null>(null);

const vt = ref(
  new ViewTree(
    false,
    undefined,
    false,
    [new ViewTree(true, (key) => <ChatTabs uniqueKey={key} />, false, [], 1)],
    1
  )
);

const handleAddChatTabs = async (topic: TopicData) => {
  if (vt.value.children.length >= 1) {
    if (focusedChat.chatTabsExpose) {
      focusedChat.chatTabsExpose.add(topic);
      return;
    }
    for (const [_, val] of tabsStore.globalSharedTabs) {
      if (!val.value.expose) continue;
      focusedChat.chatTabsExpose = val.value.expose;
      focusedChat.chatTabsExpose.add(topic);
      break;
    }
    if (!focusedChat.chatTabsExpose)
      console.warn("存在标签页但是找不到可用的导出");

    return;
  }
  const newVT = new ViewTree(
    true,
    (key) => <ChatTabs uniqueKey={key} />,
    false,
    [],
    1
  );
  vt.value.children.push(newVT);
  await nextTick();
  focusedChat.chatTabsExpose?.add(topic);
};

const { isDragging, position } = useMouseDrag(
  dragger,
  {
    init: { x: 200, y: 0 },
  },
  {
    onTryDrag: (pos) => {
      const max = window.innerWidth / 3;
      const min = Math.min(max / 3, 100);
      if (pos.x > max) return { x: max };
      else if (pos.x > min) return pos;
      else return { x: min };
    },
  }
);
const width = ref(position.value.x);
watchDebounced(
  () => position.value.x,
  () => (width.value = position.value.x),
  {
    debounce: 50,
    maxWait: 50,
  }
);
const ts = topicStore();
const { updateTopic, removeTopic } = ts;
const topics = computed(() => ts.topics);

const handleUpdateTopic = async (title: string, topicID: number) => {
  await updateTopic(title, topicID);
  tabsStore.globalSharedTabs.forEach((each) => {
    const res = each.value.topics.find((topic) => topic.id == topicID);
    if (res) res.title = title;
  });
};
const tabsStore = chatTabsStore();
const focusedChat = focusedChatStore();
</script>
<style lang="scss" scoped>
@use "/assets/tab.scss" as *;
.dragger {
  @include dragger-base();
}
</style>
