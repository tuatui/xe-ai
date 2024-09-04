<template>
  <div class="h-full flex flex-col gap-row-2">
    <div class="h0 flex-grow-1 overflow-auto">
      <div v-for="i in data.chats" class="max-w-full text-wrap break-words">
        {{ i.context }}
      </div>
    </div>
    <div class="flex flex-col">
      <div class="text-right p2">
        <VBtn
          prepend-icon="mdi-send"
          @click="updateHandle"
          :loading="data.isPending"
          >发送</VBtn
        >
      </div>
      <VTextarea
        label="请输入..."
        v-model="userInput"
        :disabled="data.isPending"
        hide-details
      />
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  topicID: number;
}>();
const userInput = ref("");
const { globalSharedChats } = chatsStore();
const data = globalSharedChats.get(props.topicID) || useChats(props.topicID);

if (!globalSharedChats.has(props.topicID)) {
  globalSharedChats.set(props.topicID, data);
  data.value.chatRefCount = 1;
} else data.value.chatRefCount++;

onUnmounted(() => {
  if (data.value.chatRefCount === 1) {
    globalSharedChats.delete(props.topicID);
    data.value.chatRefCount = 0;
  } else data.value.chatRefCount--;
});

const updateHandle = async () => {
  await data.value.updateChat(userInput.value, 0);
  userInput.value = "";
};
</script>
