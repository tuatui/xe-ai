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
        <VSelect
          class="max-w50 ml1"
          density="compact"
          :items="bots"
          v-model="selectedBots"
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
          :loading="data.isPending"
          :disabled="!selectedBots"
          >{{$t("chat.send")}}</VBtn
        >
      </VToolbar>
      <VTextarea
        rounded="0"
        :label="$t('chat.inputTips')"
        v-model="userInput"
        :disabled="data.isPending"
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

const chat2Html = (chat: ChatData) => {
  if (chat.HtmlContextCache) return chat.HtmlContextCache;
  if (chat.context) {
    chat.HtmlContextCache = htmlRender(chat.context);
    return chat.HtmlContextCache;
  }
  return "";
};
import { topicStore } from "~/stores/topic";
import { GPTChatService, type ChatSession } from "~/utils/AI";
const selectedBots = ref<BotsData>();

const { bots, getBotsData } = useBots();

/* until(() => bots.value.length)
  .toBeTruthy()
  .then(() => (selectedBots.value = bots.value.at(-1)));
 */
const dBot = defalutBotStore();

(async () => {
  await until(() => dBot.defalutBotInfo.preferBotID).toMatch(
    (v) => v !== undefined
  );
  if (selectedBots.value !== undefined) return;
  const res = await getBotsData(dBot.defalutBotInfo.preferBotID);
  if (!res) return;
  selectedBots.value = res.pop();
})();

const modelList = computed(() => {
  return selectedBots.value?.avaiableModel ?? [];
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

  const chatSteam = gptChat.createChat(data.value.chats, selectedModel.value);

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

const determineSetting = async () => {
  const [res] = await getTopicData(props.topicID);
  if (res.prederSetting) {
    selectedModel.value = res.prederSetting.preferModelName;
    [selectedBots.value] = await getBotsData(res.prederSetting.preferBotID);
    return;
  }
  if (dBot.defalutBotInfo.preferModelName !== undefined)
    selectedModel.value = dBot.defalutBotInfo.preferModelName;
  if (dBot.defalutBotInfo.preferBotID !== undefined)
    [selectedBots.value] = await getBotsData(dBot.defalutBotInfo.preferBotID);
};
determineSetting();

watch(selectedModel, (newVal) => {
  if (newVal !== undefined && selectedBots.value?.id !== undefined)
    updateTopic2(
      {
        prederSetting: {
          preferBotID: selectedBots.value?.id,
          preferModelName: newVal,
        },
      },
      props.topicID
    );
});
watch(selectedBots, (newVal) => {
  if (newVal !== undefined && selectedModel.value !== undefined)
    updateTopic2(
      {
        prederSetting: {
          preferBotID: newVal.id,
          preferModelName: selectedModel.value,
        },
      },
      props.topicID
    );
});
</script>
<style lang="scss">
@use "/assets/markdown.scss";
</style>
