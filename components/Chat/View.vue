<template>
  <div class="h-full flex flex-col overflow-hidden">
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
          @should-scroll="() => {
            scrollToEnd(contentBody!, { behavior: 'instant' });
            isScrollToEnd = true;
          }
          "
          class="max-w-full text-wrap break-words mt16"
        />
      </article>
      <div class="sticky bottom-0 w-[min(100%,calc(45rem+120px))] mxa pr1 h0">
        <div class="absolute bottom-0 right-0 h48px">
          <VFab
            :title="$t('chat.scrollToBottom')"
            class="w-full justify-end"
            :active="!isScrollToEnd"
            @click="scrollToEnd(contentBody!)"
            variant="elevated"
            color="secondary"
            icon
          >
            <div class="w0 overflow-hidden">
              {{ $t("chat.scrollToBottom") }}
            </div>
            <VIcon icon="mdi-chevron-down" />
          </VFab>
        </div>
      </div>
    </div>
    <div
      class="flex flex-col min-h-0px"
      :style="{ height: `${inputAreaHeight}px` }"
      ref="chatInputArea"
    >
      <div class="view-dragger-parent">
        <div
          class="view-dragger offset-y"
          ref="dragger"
          :class="{ active: isDragging }"
        ></div>
      </div>
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
        <XCommonBtn
          icon
          density="comfortable"
          class="ml4"
          @click="takeSnapshot"
          use-icon="mdi-download"
          :use-tooltip="$t('chat.download')"
          tooltip-location="top"
        />
        <VSpacer />
        <VExpandXTransition>
          <XCommonBtn
            @click="data.stopChatting()"
            v-show="data.isProducing"
            density="comfortable"
            icon
            use-icon="mdi-stop"
            color="error"
            variant="elevated"
            class="mr1"
            rounded
            :use-tooltip="$t('chat.stop')"
            tooltip-location="top"
          />
        </VExpandXTransition>

        <VBtn
          prepend-icon="mdi-send"
          color="primary"
          variant="elevated"
          @click="updateHandle"
          :disabled="!selectedBots || data.isProducing"
          :loading="data.isProducing"
          >{{ $t("chat.send") }}</VBtn
        >
      </VToolbar>
      <VTextarea
        rows="1.5"
        row-height="0"
        class="custom-flex-v-textarea"
        rounded="0"
        :label="$t('chat.inputTips')"
        v-model="userInput"
        hide-details
        no-resize
      />
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ topics: TopicData }>();
const userInput = ref("");
const { globalSharedChats } = chatsStore();
const { getTopicData, updateTopic } = topicStore();
const data =
  globalSharedChats.get(props.topics.id) || useChats(props.topics.id);

const chatInputArea = ref<HTMLElement | null>(null);
const inputAreaHeight = ref(200);
const dragger = ref<HTMLElement | null>(null);
const { isDragging } = useMouseDrag(
  dragger,
  { triggerOnElemResize: false, triggerOnWindowResize: false },
  {
    onTryDrag: (pos) => {
      const el = chatInputArea.value?.parentElement;
      if (!el) return;
      const { bottom, top } = el.getBoundingClientRect();
      const targetMinHeight = Math.min(
        bottom - Math.max(pos.y, top),
        el.scrollHeight - 64 /* 为了不占满空间 */
      );
      inputAreaHeight.value = targetMinHeight < 100 ? 100 : targetMinHeight;
      if (isScrollToEnd.value)
        nextTick().then(
          () =>
            contentBody.value &&
            scrollToEnd(contentBody.value, { behavior: "instant" })
        );
    },
  }
);

if (!globalSharedChats.has(props.topics.id)) {
  globalSharedChats.set(props.topics.id, data);
  data.value.chatRefCount = 1;
} else data.value.chatRefCount++;

onUnmounted(() => {
  if (data.value.chatRefCount === 1) {
    globalSharedChats.delete(props.topics.id);
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
    apiKey: newVal.secret_key,
    baseURL: newVal.apiUrl,
  });
});

const updateHandle = async () => {
  if (!gptChat) return;
  if (data.value.isProducing) return;

  await data.value.updateChat(userInput.value, ChatRole.user);
  userInput.value = "";

  const res = await data.value.updateChat("", ChatRole.assistant);
  if (res === undefined) return;
  const chat = data.value.chats.findLast((c) => c.id === res);
  if (chat === undefined) return;

  nextTick().then(() => {
    contentBody.value &&
      scrollToEnd(contentBody.value, { behavior: "instant" });
  });

  try {
    data.value.isProducing = true;
    const chatSteam = await gptChat.createChat(
      data.value.chats,
      selectedModel.value
    );
    data.value.stopChatting = chatSteam.stop;
    for await (const { context } of chatSteam) {
      chat.context += context;
      updateDebounced(data, chat);
    }
  } catch (error) {
  } finally {
    data.value.isProducing = false;
  }
};
const updateDebounced = useDebounceFn(
  (data: useChatReturn, chat: ChatData) =>
    data.value.updateChat(chat.context, ChatRole.assistant, chat.id),
  100
);

const determineSetting = async () => {
  const [res] = await getTopicData(props.topics.id);
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
    updateTopic({
      id: props.topics.id,
      preferSetting: {
        preferBotID: selectedBots.value?.id,
        preferModelName: newVal,
      },
    });
};
const handleUpdateSelectedBots = (newVal?: BotsData) => {
  if (newVal !== undefined && selectedModel.value !== undefined)
    updateTopic({
      id: props.topics.id,
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
const { t } = useI18n();
const theme = useTheme();
const takeSnapshot = async () => {
  if (!contentBody.value) return;

  const isDark = theme.current.value.dark;
  // 我们只需要获取uno-css和markdown-body的style sheet就可以了
  const careClassNames: string[] = [
    contentBody.value.classList[0],
    contentBody.value.classList[1],
  ];
  console.log(isDark);
  toSnapshot({
    careClassNames,
    isDark,
    mainClassName: contentBody.value.classList[0], // "markdown-body"
    html: contentBody.value.children[0].outerHTML,
    title: props.topics.title || t("chat.untitled"),
  });
};
</script>
<style lang="scss" scoped>
@use "/assets/tab.scss" as *
  with(
    $highlight-color: black,
    $view-border-width: 0rem,
    $view-dragger-width: 0.2rem
  );
.view-dragger-parent {
  position: relative;
  .view-dragger {
    width: 100%;
    height: 100%;
    position: absolute;

    @include dragger-base;
  }
}
</style>
<style lang="scss">
.custom-flex-v-textarea {
  &.v-input--horizontal {
    grid-template-rows: 1fr auto;
    textarea {
      height: 100%;
      min-height: 0px;
    }
  }
}
</style>
