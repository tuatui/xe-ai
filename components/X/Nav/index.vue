<template>
  <VNavigationDrawer
    v-model="mobile.showNav"
    temporary
    :rail="isRail"
    disable-resize-watcher
    :permanent="!mobile.isMobileScreen"
    :width="width"
    :class="bgSurface"
    :aria-label="$L.aria.sideNav"
    :aria-hidden="!mobile.showNav"
  >
    <div class="h-full w-full flex flex-col">
      <VToolbar
        :density="mobile.isMobileScreen ? `comfortable` : `compact`"
        class="!bg-inherit"
      >
        <XCommonBtn
          icon
          use-icon="i-mdi-menu"
          variant="text"
          @click="handleToggleNav"
          tooltip-location="right center"
          :use-tooltip="isRail ? $L.tips.expandMenu : $L.tips.collapseMenu"
        />
      </VToolbar>
      <div class="px4 py14px box-border" :class="{ px1: isRail, py2: isRail }">
        <XCommonBtn
          class="overflow-hidden"
          :icon="isRail"
          use-icon="i-mdi-plus"
          variant="tonal"
          @click="handleAddTopic"
          :use-tooltip="$L.tips.newChatLong"
          tooltip-location="right center"
          :embed-tooltip="!isRail"
        />
      </div>
      <VDivider />
      <VSpacer v-show="isRail" />
      <XNavList :is-hidden="isRail" @add-chat="handleOpenNewChat" />

      <VDivider />
      <div class="flex flex-wrap box-border px1" :class="{ py1: isRail }">
        <Setting />
        <I18nSwitch />
        <ThemeSwitch />
        <UserLogout />
      </div>
    </div>
    <BottomSnackBar />
    <ChatViewConfDialog />
    <Teleport to="body" v-if="!mobile.isMobileScreen">
      <XNavResizer v-model="width" v-show="!isRail" />
    </Teleport>
  </VNavigationDrawer>
</template>
<script setup lang="ts">
import { chatTreeStore } from "~/stores/chatTree";
const { setting, mobile } = storeToRefs(defaultSettingSync());

const isRail = computed(() => Boolean(setting.value.isNavRail));
const width = ref(201);
const { updateTopic } = topicStore();
const { add: openNewChat } = chatTreeStore();
const handleAddTopic = async () => {
  const newTopic = { title: "" };
  const res = await updateTopic(newTopic);
  openNewChat(res);
  if (mobile.value.isMobileScreen) mobile.value.showNav = !mobile.value.showNav;
};
const handleToggleNav = () => {
  if (!mobile.value.isMobileScreen)
    setting.value.isNavRail = !setting.value.isNavRail;
  else mobile.value.showNav = !mobile.value.showNav;
};
const handleOpenNewChat = (topic: TopicData) => {
  openNewChat(topic);
  if (mobile.value.isMobileScreen) mobile.value.showNav = !mobile.value.showNav;
};
const bgSurface = {
  "bg-surface-light": !mobile.value.isMobileScreen,
};
</script>
