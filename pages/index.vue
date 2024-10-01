<template>
  <VLayout>
    <VNavigationDrawer
      disable-resize-watcher
      permanent
      :width="width"
      :aria-label="$t('aria.sideNav')"
    >
      <div class="h-full w-full flex flex-col">
        <NavList @add-chat="handleAddChatTabs" />
        <VDivider />
        <div class="flex gap1">
          <Setting />
          <VMenu>
            <template v-slot:activator="{ props }">
              <XCommonBtn
                icon
                v-bind="props"
                variant="text"
                tooltip-location="top"
                :use-tooltip="$t('common.language')"
                use-icon="mdi-translate"
              />
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
          <XCommonBtn
            variant="text"
            icon
            @click="theme.global.name.value = isDarkTheme ? 'light' : 'dark'"
            :use-tooltip="$t('setting.switchTheme')"
            use-icon="mdi-theme-light-dark"
          />
        </div>
      </div>
      <BottomSnackBar />
    </VNavigationDrawer>
    <VMain class="max-h-100dvh">
      <AdjustableView v-model="vt" />
    </VMain>
    <div
      ref="dragger"
      class="dragger offset-x top-0px fixed h-100dvh cursor-col-resize"
      :class="{ active: isDragging }"
      :style="{ left: `${position.x}px` }"
    ></div>
  </VLayout>
</template>
<script setup lang="tsx">
const theme = useTheme();
const isDarkTheme = computed(() => theme.global.current.value.dark);
const { setLocale, locales, locale, localeProperties } = useI18n();
useHead({
  htmlAttrs: {
    lang: () => localeProperties.value?.language,
    dir: () => localeProperties.value?.dir ?? "ltr",
  },
});

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
const tabsStore = chatTabsStore();
const focusedChat = focusedChatStore();
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
</script>
<style lang="scss" scoped>
@use "/assets/tab.scss" as *;
.dragger {
  @include dragger-base();
}
</style>
