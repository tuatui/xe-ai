<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div
      class="markdown-body h0 flex-grow-1 relative overflow-y-auto py4"
      @dblclick="isCollapse = false"
      ref="contentBody"
      @scroll="handleScroll"
    >
      <article class="w-[min(100%,45rem)] mxa px2">
        <ChatContentItem
          v-for="i in data.chats"
          :key="i.id"
          :is-scroll-to-end="isScrollToEnd"
          :chat="i"
          @should-scroll="
            () => {
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
    <VDivider />
    <VExpandTransition>
      <div
        class="flex flex-col min-h-0px"
        v-if="!isCollapse"
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

        <VTextarea
          autofocus
          variant="solo"
          rows="1.5"
          row-height="0"
          class="custom-flex-v-textarea"
          rounded="0"
          :label="$t('chat.inputTips')"
          v-model="userInput"
          hide-details
          no-resize
        />
        <VDivider />
        <VToolbar density="compact">
          <VBtn
            class="relative z-6 mr1"
            prepend-icon="mdi-send"
            color="primary"
            variant="elevated"
            @click="updateHandle"
            :disabled="!selectedBots || data.isProducing"
            :loading="data.isProducing"
            >{{ $t("chat.send") }}</VBtn
          >

          <XCommonBtn
            @click="data.stopChatting()"
            class="relative z-5 mr1 btn-t"
            :class="{ active: data.isProducing }"
            :disabled="!data.isProducing"
            density="comfortable"
            icon
            use-icon="mdi-stop"
            color="error"
            variant="elevated"
            rounded
            :use-tooltip="$t('chat.stop')"
            tooltip-location="top"
          />

          <XCommonBtn
            class="mr1"
            icon
            density="comfortable"
            rounded
            @click="handleConf"
            use-icon="mdi-message-settings-outline"
            use-tooltip="聊天设置"
            tooltip-location="top"
          />
          <XCommonBtn
            class="mr1"
            icon
            density="comfortable"
            rounded
            @click="takeSnapshot"
            use-icon="mdi-download-box-outline"
            :use-tooltip="$t('chat.download')"
            tooltip-location="top"
          />
          <XCommonBtn
            class="mr1"
            icon
            density="comfortable"
            rounded
            @click="isCollapse = true"
            use-icon="mdi-arrow-collapse"
            use-tooltip="收起输入框（双击展开）"
            tooltip-location="top"
          />

          <!-- <XCommonBtn
          class="mr1"
          icon
          density="comfortable"
          rounded
          @click="data.isProducing = !data.isProducing"
          use-icon="mdi-download-box-outline"
          :use-tooltip="$t('chat.download')"
          tooltip-location="top"
        /> -->
          <VSpacer />
          <div class="text-body-2 text-medium-emphasis ellipsis-text">
            <VIcon icon="mdi-robot" size="small" />
            <p>{{ selectedBots?.nickName || "未选择" }}</p>
            <VIcon icon="mdi-brain" size="small" />
            <p>{{ selectedModel || "未选择" }}</p>
          </div>
        </VToolbar>
      </div>
    </VExpandTransition>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ topics: TopicData }>();
const userInput = ref("");
const { globalSharedChats } = chatsStore();
const { updateTopic } = topicStore();

const data =
  globalSharedChats.get(props.topics.id) || useChats(props.topics.id);

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

const defaultBot = defaultBotStore();
const selectedBots = ref<BotsData>();
const selectedModel = ref<string>();
const { getBotsData } = useBots();

const { chatSetting } = data.value.tempStore;
if (chatSetting) {
  selectedBots.value = chatSetting.useBotData;
  selectedModel.value = chatSetting.useModelName;
} else {
  (async (): Promise<void> => {
    const conf: Partial<globalThis.DefaultBotSetting> = {
      ...deleteUndefined(defaultBot.defaultBotInfo),
      ...deleteUndefined(props.topics.preferSetting),
    };
    data.value.tempStore.chatSetting = {
      useBotData: (await getBotsData(conf.preferBotID)).pop(),
      useModelName: conf.preferModelName,
    };
  })();
}
let chatSession: ChatSession | undefined | null;
const { Services } = chatServices();

watch(
  () => data.value.tempStore.chatSetting,
  (newSetting) => {
    selectedBots.value = newSetting?.useBotData;
    selectedModel.value = newSetting?.useModelName;
    if (selectedBots.value) {
      chatSession = Services[selectedBots.value.provider]?.createChatSession({
        apiKey: selectedBots.value.secretKey,
        baseURL: selectedBots.value.apiUrl,
      });
    } else chatSession = null;
  },
);

const handleConf = async () => {
  try {
    const res = await topicConf().showTopicConfDialog(
      selectedBots.value,
      selectedModel.value,
    );
    data.value.tempStore.chatSetting = {
      useBotData: res.newBot,
      useModelName: res.newModelName,
    };
    await updateTopic(
      {
        id: props.topics.id,
        preferSetting: {
          preferBotID: res.newBot?.id,
          preferModelName: res.newModelName,
        },
      },
      false,
    );
  } catch (_) {
    /* ignore */
  }
};

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
        el.scrollHeight - 65 /* 为了不占满空间 */,
      );
      inputAreaHeight.value = targetMinHeight < 102 ? 102 : targetMinHeight;
      if (isScrollToEnd.value)
        nextTick().then(
          () =>
            contentBody.value &&
            scrollToEnd(contentBody.value, { behavior: "instant" }),
        );
    },
  },
);

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
  { once: true },
);

const updateHandle = async () => {
  if (!chatSession) return;
  if (data.value.isProducing) return;

  await data.value.updateChat({
    context: userInput.value,
    from: ChatRole.user,
  });
  userInput.value = "";
  const res = await data.value.updateChat({
    context: "",
    from: ChatRole.assistant,
  });
  if (res === undefined) return;
  const chat = data.value.chats.findLast((c) => c.id === res);
  if (chat === undefined) return;

  nextTick().then(() => {
    contentBody.value &&
      scrollToEnd(contentBody.value, { behavior: "instant" });
  });

  try {
    data.value.isProducing = true;
    const chatSteam = await chatSession.createChat(
      data.value.chats,
      selectedModel.value,
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
    data.value.updateChat({
      context: chat.context,
      from: ChatRole.assistant,
      id: chat.id,
    }),
  100,
);

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
  toSnapshot({
    careClassNames,
    isDark,
    mainClassName: contentBody.value.classList[0], // "markdown-body"
    html: contentBody.value.children[0].outerHTML,
    title: props.topics.title || t("chat.untitled"),
  });
};

const isCollapse = ref(false);
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
    .v-field--variant-solo {
      box-shadow: none;
    }
    textarea {
      height: 100%;
      min-height: 0px;
    }
  }
}
.btn-t {
  transform: translateX(-100%) scale(0.5);
  :first-child {
    transition: opacity 0.2s ease-in-out;
  }
  &.active {
    transform: translateX(0px) scale(1);
  }
}
.ellipsis-text {
  min-width: 0px;
  margin-right: 0.25rem;
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  gap: 0 0.25rem;
  p {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
