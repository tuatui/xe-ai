<template>
  <div
    class="chat-content"
    ref="contentEle"
    :class="{ 'text-medium-emphasis': chat.isDisabled }"
  >
    <ChatTool v-if="chat.from === ChatRole.tool" :chat />
    <ChatContentItem v-else :chat class="max-w-full text-wrap! break-words!" />

    <div class="chat-tool-bar">
      <VBtn
        variant="text"
        :ripple="false"
        rounded
        density="compact"
        size="small"
        @click="copy"
        :title="$L.common.copy"
        icon
      >
        <VIcon class="i-mdi-content-copy text-medium-emphasis" />
      </VBtn>
      <VBtn
        variant="text"
        :ripple="false"
        rounded
        density="compact"
        size="small"
        @click="edit(chat)"
        :title="$L.common.edit"
        icon
      >
        <VIcon class="i-mdi-text-box-edit-outline text-medium-emphasis" />
      </VBtn>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ chat: ChatData }>();
const contentEle = ref<HTMLDivElement>();
const copy = () => {
  copy2Clipboard(contentEle.value?.textContent ?? "");
  notificationStore().pushNotification({
    content: useNuxtApp().$L.tips.copySuccess,
    timeout: 1000,
  });
};
const { edit } = chatEditStore();
</script>
<style lang="scss" scoped>
.chat-content {
  position: relative;
  padding-bottom: 8px;
  margin: 32px 0;

  .chat-tool-bar {
    position: absolute;
    bottom: 0px;
    left: -3px;
    visibility: hidden;
    transition: 200ms;
    opacity: 0;
  }
  &:hover {
    .chat-tool-bar {
      visibility: visible;
      opacity: 1;
    }
  }
}
</style>
