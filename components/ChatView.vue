<template>
  <div class="h-full flex flex-col gap-row-2">
    <div class="h0 flex-grow-1 overflow-auto">
      <div v-for="i in chats" class="max-w-full text-wrap break-words">
        {{ i.context }}
      </div>
    </div>
    <div class="flex flex-col">
      <div class="text-right p2">
        <VBtn prepend-icon="mdi-send" @click="updateHandle" :loading="isPending"
          >发送</VBtn
        >
      </div>
      <VTextarea
        label="请输入..."
        v-model="userInput"
        :disabled="isPending"
        hide-details
      />
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  topicID?: number;
}>();
const userInput = ref("");
const { chats, isPending, updateChat } = useChats(
  computed(() => props.topicID)
);
const updateHandle = async () => {
  await updateChat(userInput.value, 0);
  userInput.value = "";
};
</script>
