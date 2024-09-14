<template>
  <div class="h-full flex flex-col">
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
      <VToolbar density="compact">
        <VBtn
          icon="mdi-brain"
          size="large"
          density="compact"
          rounded="lg"
        ></VBtn>
        <!-- <VSelect
            class="max-w50"
            prepend-inner-icon="mdi-brain"
            density="compact"
            :items="bots"
            v-model="selectedBots"
            :item-props="
              (item) => ({ title: item.nick_name, subtitle: item.name })
            "
            return-object
            hide-details
          /> -->
        <VSpacer />
        <VBtn
          icon="mdi-send"
          size="large"
          color="primary"
          variant="elevated"
          density="compact"
          rounded="lg"
          @click="updateHandle"
          :loading="data.isPending"
          :disabled="!selectedBots"
        ></VBtn>
      </VToolbar>
      <VTextarea
        rounded="0"
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
console.log(data);
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
import { GPTChatService, type ChatSession } from "~/utils/AI";
const selectedBots = ref<BotsData>();
const { bots } = useBots();
until(() => bots.value.length)
  .toBeTruthy()
  .then(() => (selectedBots.value = bots.value.at(-1)));

let gptChat: ChatSession | undefined | null;
watch(selectedBots, (newVal) => {
  if (!newVal) {
    gptChat = undefined;
    return;
  }
  gptChat = GPTChatService.createChatSession({
    apiKey: newVal?.secret_key,
    baseURL: "https://apic.ohmygpt.com/v1",
  });
});

const updateHandle = async () => {
  if (!gptChat) return;

  await data.value.updateChat(userInput.value, ChatRole.user);
  userInput.value = "";

  const chatSteam = gptChat.createChat(data.value.chats, "gpt-4o-mini");

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
