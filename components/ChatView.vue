<template>
  <div class="h-full flex flex-col gap-row-2">
    <div
      class="markdown-body h0 flex-grow-1 overflow-auto py4"
      :class="{ dark: $vuetify.theme.current.dark }"
    >
      <article class="w-[min(100%,45rem)] mxa px2">
        <div
          v-for="i in data.chats"
          class="max-w-full text-wrap break-words my16"
          v-html="chat2Html(i)"
        ></div>
      </article>
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
import { htmlRender } from "~/utils/HtmlRender";

const props = defineProps<{ topicID: number }>();
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

const chat2Html = (chat: ChatData) => {
  if (chat.HtmlContextCache) return chat.HtmlContextCache;
  if (chat.context) {
    chat.HtmlContextCache = htmlRender(chat.context);
    return chat.HtmlContextCache;
  }
  return "";
};
import { GPTChat } from "~/utils/AI";

const { bots } = useBots();
const open = (async () => {
  await until(() => bots.value.length).toBeTruthy();
  const apiKey = bots.value.find(
    (e) => e.nick_name === "dev_test2"
  )?.secret_key;
  return new GPTChat(apiKey, "https://apic.ohmygpt.com/v1");
})();

const updateHandle = async () => {
  await data.value.updateChat(userInput.value, ChatRole.user);
  userInput.value = "";

  const chatSteam = (await open).createChat(data.value.chats, "gpt-4o-mini");

  const res = await data.value.updateChat("", ChatRole.assistant);
  if (res === undefined) return;
  const chat = data.value.chats.findLast((c) => c.id === res);
  if (chat === undefined) return;
  
  for await (const { context } of chatSteam) {
    chat.context += context;
    chat.HtmlContextCache = htmlRender(chat.context);
    updateDebounced(data, chat);
  }
};
const updateDebounced = useDebounceFn(
  (data: useChatReturn, chat: ChatData) =>
    data.value.updateChat(chat.context, ChatRole.assistant, chat.id),
  100
);
</script>
<style lang="scss">
@use "/assets/markdown.scss";
</style>
