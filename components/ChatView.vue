<template>
  <div class="h-full flex flex-col">
    <div
      class="markdown-body h0 flex-grow-1 relative overflow-y-auto py4"
      ref="contentBody"
      @scroll="handleScroll"
    >
      <article class="w-[min(100%,45rem)] mxa px2">
        <ChatContentItem
          v-for="i in data.chats"
          :key="i.id"
          :is-scroll-to-end="isScrollToEnd"
          :chat="i"
          @should-scroll="scrollToEnd(contentBody!, { behavior: 'instant' })"
          class="max-w-full text-wrap break-words my16"
        />
      </article>
      <div
        class="sticky bottom-0 w-[min(100%,calc(45rem+120px))] mxa h48px pr1"
      >
        <VFab
          class="w-full justify-end"
          :active="!isScrollToEnd"
          @click="scrollToEnd(contentBody!)"
          icon="mdi-chevron-down"
          variant="elevated"
          color="secondary"
        />
      </div>
    </div>
    <div class="flex flex-col">
      <VToolbar density="compact">
        <VSelect
          class="max-w50 ml1"
          density="compact"
          :items="bots"
          v-model="selectedBots"
          @update:model-value="handleUpdateSelectedBots"
          :item-props="(item) => ({ title: item.nick_name })"
          return-object
          hide-details
        >
          <template v-slot:item="{ props, item }">
            <VListItem
              v-bind="props"
              class="overflow-hidden min-w0 text-wrap break-all"
            >
              <template v-slot:append>
                <component :is="Services[item.value.provider]?.info?.icon" />
              </template>
            </VListItem>
          </template>
        </VSelect>
        <VSelect
          class="max-w50 ml1"
          density="compact"
          :items="modelList"
          v-model="selectedModel"
          @update:model-value="handleUpdateSelectedModel"
          :item-props="
            (item) => ({
              title: item.name,
              subtitle: item.owner,
              value: item.name,
            })
          "
          hide-details
        />
        <VSpacer />
        <VBtn
          prepend-icon="mdi-send"
          color="primary"
          variant="elevated"
          @click="updateHandle"
          :disabled="!selectedBots"
          >{{ $t("chat.send") }}</VBtn
        >
      </VToolbar>
      <VTextarea
        rounded="0"
        :label="$t('chat.inputTips')"
        v-model="userInput"
        hide-details
      />
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ topicID: number }>();
const userInput = ref("");
const { globalSharedChats } = chatsStore();
const { getTopicData, updateTopic2 } = topicStore();
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
watch(
  () => data.value.chats.length,
  async (newVal, oldVal) => {
    if (oldVal >= newVal) return;

    await until(contentBody).toBeTruthy();
    if (data.value.tempStore.scrollTop !== undefined || !contentBody.value)
      return;
    scrollToEnd(contentBody.value, { behavior: "instant" });
    data.value.tempStore.scrollTop = contentBody.value.scrollTop;
    isScrollToEnd.value = true;
  },
  { once: true }
);

import { topicStore } from "~/stores/topic";
import { GPTChatService, type ChatSession } from "~/utils/AI";
const selectedBots = ref<BotsData>();

const { bots, getBotsData } = useBots();

/* until(() => bots.value.length)
  .toBeTruthy()
  .then(() => (selectedBots.value = bots.value.at(-1)));
 */
const dBot = defaultBotStore();

(async () => {
  await until(() => dBot.defaultBotInfo.preferBotID).toMatch(
    (v) => v !== undefined
  );
  if (selectedBots.value !== undefined) return;
  const res = await getBotsData(dBot.defaultBotInfo.preferBotID);
  if (!res) return;
  selectedBots.value = res.pop();
})();

const modelList = computed(() => {
  return selectedBots.value?.availableModel ?? [];
});
const selectedModel = ref<string>();
watch(
  () => modelList.value.length,
  (newVal) => {
    if (!newVal) return;
    if (selectedModel.value !== undefined) return;
    selectedModel.value = modelList.value[0].name;
  }
);

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

  nextTick().then(() => contentBody.value && scrollToEnd(contentBody.value));

  const chatSteam = gptChat.createChat(data.value.chats, selectedModel.value);

  const res = await data.value.updateChat("", ChatRole.assistant);
  if (res === undefined) return;
  const chat = data.value.chats.findLast((c) => c.id === res);
  if (chat === undefined) return;

  for await (const { context } of chatSteam) {
    chat.context += context;
    updateDebounced(data, chat);
  }
};
const updateDebounced = useDebounceFn(
  (data: useChatReturn, chat: ChatData) =>
    data.value.updateChat(chat.context, ChatRole.assistant, chat.id),
  100
);

const determineSetting = async () => {
  const [res] = await getTopicData(props.topicID);
  if (res.preferSetting) {
    selectedModel.value = res.preferSetting.preferModelName;
    [selectedBots.value] = await getBotsData(res.preferSetting.preferBotID);
    return;
  }
  if (dBot.defaultBotInfo.preferModelName !== undefined)
    selectedModel.value = dBot.defaultBotInfo.preferModelName;
  if (dBot.defaultBotInfo.preferBotID !== undefined)
    [selectedBots.value] = await getBotsData(dBot.defaultBotInfo.preferBotID);
};
determineSetting();

const handleUpdateSelectedModel = (newVal?: string) => {
  if (newVal !== undefined && selectedBots.value?.id !== undefined)
    updateTopic2({
      id: props.topicID,
      preferSetting: {
        preferBotID: selectedBots.value?.id,
        preferModelName: newVal,
      },
    });
};
const handleUpdateSelectedBots = (newVal?: BotsData) => {
  if (newVal !== undefined && selectedModel.value !== undefined)
    updateTopic2({
      id: props.topicID,
      preferSetting: {
        preferBotID: newVal.id,
        preferModelName: selectedModel.value,
      },
    });
};

const contentBody = ref<HTMLDivElement>();
const isScrollToEnd = ref(true);
const handleScroll = (ev: Event) => {
  const target = ev.target as HTMLDivElement;
  isScrollToEnd.value =
    Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 20;
  handleUpdateScrollStatus();
};
const handleUpdateScrollStatus = useDebounceFn(() => {
  data.value.tempStore.scrollTop = contentBody.value?.scrollTop;
}, 200);

onMounted(() => {
  if (data.value.tempStore.scrollTop !== undefined && contentBody.value) {
    contentBody.value.scrollTo({
      top: data.value.tempStore.scrollTop,
      behavior: "instant",
    });
  }
});
</script>
