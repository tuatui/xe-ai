<template>
  <div class="flex flex-col h-full">
    <VAppBar :density="mobile.isMobileScreen ? `comfortable` : `compact`">
      <template v-slot:prepend>
        <VAppBarNavIcon @click="handleToggleNav" />
      </template>

      <VAppBarTitle>{{
        data.topics[0]?.title || $L.chat.untitled
      }}</VAppBarTitle>
      <VSpacer />
      <XCommonBtn
        v-if="data.isCollapse"
        icon
        variant="text"
        @click.stop="data.isCollapse = false"
        use-icon="i-mdi-chevron-up"
        :use-tooltip="$L.chat.noCollapse"
      />
      <VBtn
        v-if="!mobile.isMobileScreen"
        icon="i-mdi-close"
        :title="$L.common.back"
        @click="() => chatTreeStore().init()"
      />
    </VAppBar>
    <template v-if="data.topics[0]">
      <ChatView
        :key="data.topics[0].id"
        :topics="data.topics[0]"
        class="h-full"
        v-model="data.isCollapse"
        @update-title="(n) => (data.topics[0].title = n)"
      />
    </template>
  </div>
</template>
<script setup lang="tsx">
import { chatTreeStore, LeafType } from "~/stores/chatTree";
import type { LeafComponentProps } from "~/types/adjustableView";

const { uniqueKey } = defineProps<LeafComponentProps>();
const { globalSharedTabs: globalTabs } = chatTabsStore();

const data =
  globalTabs.get(uniqueKey) ||
  ref<ChatTabsData>({ topics: [], currTab: undefined, type: LeafType.tabsM });

if (!globalTabs.has(uniqueKey)) globalTabs.set(uniqueKey, data);
onUnmounted(() => globalTabs.delete(uniqueKey));

data.value.expose = {
  add: (topic: TopicData): void => {
    data.value.topics[0] = topic;
    data.value.currTab = topic.id;
  },
  remove: () => console.warn("移动设备视图不支持删除，可以添加新的顶掉"),
  getAll: () => data.value.topics,
  getCurr: () => data.value.topics[0],
};
focusedChatStore().chatTabsExpose = data.value.expose;
const { mobile } = storeToRefs(defaultSettingSync());
const handleToggleNav = () => (mobile.value.showNav = !mobile.value.showNav);
</script>
