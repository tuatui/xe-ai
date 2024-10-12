<template>
  <VNavigationDrawer
    :rail="isRail"
    disable-resize-watcher
    permanent
    :width="width"
    class="box-content"
    :aria-label="$t('aria.sideNav')"
  >
    <div class="h-full w-full flex flex-col">
      <VToolbar density="compact">
        <XCommonBtn
          icon
          use-icon="mdi-menu"
          variant="text"
          @click="isRail = !isRail"
          tooltip-location="right center"
          :use-tooltip="isRail ? `展开菜单` : `收起菜单`"
        />
      </VToolbar>

      <XNavList
        class="relative z-2 box-border"
        :rail="isRail"
        @add-chat="(topic) => $emit('addChatTab', topic)"
        @new-topic-with-chat="handleAddTopic"
      />

      <VDivider />
      <div class="bg-surface-light flex flex-wrap box-border p1">
        <Setting />
        <I18nSwitch />
        <ThemeSwitch />
        <UserLogout />
      </div>
    </div>
    <BottomSnackBar />
    <ChatViewConfDialog />
    <Teleport to="body">
      <XNavResizer v-model="width" v-show="!isRail" />
    </Teleport>
  </VNavigationDrawer>
</template>
<script setup lang="ts">
const emit = defineEmits<{ addChatTab: [topic: TopicData] }>();

const isRail = ref(false);
const width = ref(200);
const { updateTopic } = topicStore();

const handleAddTopic = async () => {
  const newTopic = { title: "" };
  const res = await updateTopic(newTopic);
  emit("addChatTab", res);
};
</script>
