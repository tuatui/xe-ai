<template>
  <div class="flex flex-col overflow-hidden">
    <div
      class="markdown-body h0 flex-grow-1 relative overflow-y-auto py4"
      @dblclick="isCollapse = false"
      ref="contentBody"
      @scroll="handleScroll"
    >
      <article class="w-[min(100%,45rem)] mxa px2">
        <template v-for="(i, index) in data.chats" :key="i.id">
          <ChatContentItem
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
          <div
            v-if="
              selectedBots?.memoCount !== undefined &&
              index === data.chats.length - selectedBots.memoCount - 1
            "
            role="separator"
            class="text-center bg-surface-light text-body-2 rounded my16"
          >
            模型不会记住在此之前的对话
          </div>
        </template>
      </article>
      <div class="sticky bottom-0 w-[min(100%,calc(45rem+120px))] mxa h0">
        <div class="absolute bottom-0 right-0 h48px mr2">
          <VFab
            :title="$L.chat.scrollToBottom"
            class="w-full justify-end"
            :active="!isScrollToEnd"
            @click="scrollToEnd(contentBody!)"
            variant="elevated"
            color="secondary"
            icon
          >
            <div class="w0 overflow-hidden">
              {{ $L.chat.scrollToBottom }}
            </div>
            <VIcon icon="i-mdi-chevron-down" />
          </VFab>
        </div>
      </div>
    </div>
    <VDivider />
    <div class="view-dragger-parent">
      <div
        class="view-dragger offset-y"
        ref="dragger"
        :class="{ active: isDragging }"
      ></div>
    </div>
    <VExpandTransition>
      <div
        class="flex flex-col min-h-0px"
        v-if="!isCollapse"
        :style="{ height: `${inputAreaHeight}px` }"
        ref="chatInputArea"
      >
        <VTextarea
          autofocus
          variant="solo"
          rows="1.5"
          row-height="0"
          class="custom-flex-v-textarea"
          rounded="0"
          :label="$L.chat.inputTips"
          v-model="userInput"
          hide-details
          no-resize
        />
        <VDivider />
        <div
          class="bg-surface-light min-h-48px flex items-center px2 gap1 flex-wrap"
        >
          <VBtn
            class="relative z-6 my1"
            prepend-icon="i-mdi-send"
            color="primary"
            variant="elevated"
            @click="updateHandle"
            :disabled="!isBotReady || data.isProducing"
            :loading="data.isProducing || data.isChatting"
            >{{ $L.chat.send }}</VBtn
          >

          <XCommonBtn
            @click="handleStopChat"
            class="relative z-5 btn-t"
            :class="{ active: data.isProducing }"
            :disabled="!data.isProducing"
            density="comfortable"
            icon
            use-icon="i-mdi-stop"
            color="error"
            variant="elevated"
            rounded
            :use-tooltip="$L.chat.stop"
            tooltip-location="top"
          />

          <XCommonBtn
            icon
            density="comfortable"
            rounded
            variant="text"
            @click="handleConf"
            use-icon="i-mdi-message-settings-outline"
            :use-tooltip="$L.chat.setting"
            tooltip-location="top"
          />
          <XCommonBtn
            icon
            density="comfortable"
            rounded
            variant="text"
            @click="takeSnapshot"
            use-icon="i-mdi-download-box-outline"
            :use-tooltip="$L.chat.download"
            tooltip-location="top"
          />
          <XCommonBtn
            icon
            density="comfortable"
            rounded
            variant="text"
            @click="isCollapse = true"
            use-icon="i-mdi-arrow-collapse"
            :use-tooltip="$L.chat.collapse"
            tooltip-location="top"
          />
          <VSpacer />
          <div class="text-body-2 text-medium-emphasis ellipsis-text">
            <VIcon icon="i-mdi-robot" size="small" />
            <p>{{ selectedBots?.nickName || $L.common.notSelected }}</p>
            <VIcon icon="i-mdi-brain" size="small" />
            <p>{{ selectedModel || $L.common.notSelected }}</p>
          </div>
        </div>
      </div>
    </VExpandTransition>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ topics: TopicData }>();
const emit = defineEmits<{ updateTitle: [newTitle: string]; close: [] }>();
const userInput = ref("");
const { globalSharedChats, postWinMessage } = chatsStore();
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
const isBotReady = computed(
  () => selectedBots.value !== undefined && selectedModel.value !== undefined,
);

const { chatSetting } = data.value.tempStore;
if (chatSetting) {
  selectedBots.value = chatSetting.useBotData;
  selectedModel.value = chatSetting.useModelName;
} else
  watch(
    () => defaultBot.defaultBotInfo,
    async () => {
      if (data.value.tempStore.chatSetting) return;

      const conf: Partial<globalThis.DefaultBotSetting> = {
        ...defaultBot.defaultBotInfo,
        ...props.topics.preferSetting,
      };

      if (conf.preferBotID === undefined) return;
      await until(() => botsStore().bots.length).toBeTruthy();

      data.value.tempStore.chatSetting = {
        useBotData: botsStore().bots.find((bot) => bot.id === conf.preferBotID),
        useModelName: conf.preferModelName,
      };
    },
    { immediate: true },
  );

let chatSession: ChatSession | undefined | null;
const { Services } = chatServices();

watch(
  () => data.value.tempStore.chatSetting,
  async (newSetting) => {
    selectedBots.value = newSetting?.useBotData;
    selectedModel.value = newSetting?.useModelName;
    chatSession = null;
  },
  { immediate: true },
);

watch(
  () => data.value.tempStore.shareEvent,
  async (ev) => {
    if (!ev) return;
    if (ev.title) emit("updateTitle", ev.title);
    if (ev.close) emit("close");
    if (ev.initChat) {
      const init = ev.initChat;
      userInput.value = init.userInput;
      selectedBots.value = init.botData;
      selectedModel.value = init.modelName;
      ev.initChat = undefined;
      updateHandle();
    }
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
    postWinMessage({
      updateSetting: {
        topicId: props.topics.id,
        setting: {
          useBotData: toRaw(res.newBot),
          useModelName: res.newModelName,
        },
      },
    });
  } catch (error) {
    if (error) console.warn(error);
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
const postChatMsg = (isCreate?: boolean, lastCount: number = -2) =>
  postWinMessage({
    updateChat: {
      chats: data.value.chats.slice(lastCount).map((each) => toRaw(each)),
      isProducing: data.value.isProducing,
      topicId: props.topics.id,
      isChatting: data.value.isChatting,
      isCreate,
    },
  });
const postChatStopMsg = () =>
  postWinMessage({ stopChat: { topicId: props.topics.id } });

const updateHandle = async () => {
  if (!selectedBots.value || selectedModel.value === undefined) return;
  if (data.value.isProducing) return;

  if (data.value.chats.length === 0) {
    await data.value.updateChat({
      context: selectedBots.value?.prompt ?? "",
      from: ChatRole.system,
    });
    postChatMsg(true, -1);
  }

  if (userInput.value) {
    await data.value.updateChat({
      context: userInput.value,
      from: ChatRole.user,
    });
    postChatMsg(true, -1);
    userInput.value = "";
  }

  nextTick().then(() => {
    contentBody.value &&
      scrollToEnd(contentBody.value, { behavior: "instant" });
  });

  const { out, push, stop } = bufferedOut();

  try {
    data.value.isProducing = true;
    data.value.isChatting = true;

    const chatLimit = selectedBots.value?.memoCount ?? 0;
    if (!chatSession) {
      chatSession = await Services[
        selectedBots.value.provider
      ]?.createChatSession({
        apiKey: selectedBots.value.secretKey,
        baseURL: selectedBots.value.apiUrl,
      });
      if (!chatSession) {
        throw new Error(
          "can not find chat services: " + selectedBots.value.provider,
        );
      }
    }
    const chatSteam = await chatSession.createChat(
      data.value.chats.slice(-chatLimit),
      selectedModel.value,
    );

    const res = await data.value.updateChat({
      context: "",
      from: ChatRole.assistant,
    });
    postChatMsg(true, -1);
    if (res < 0) throw new Error("Unable to update chat");
    const chat = data.value.chats.findLast((c) => c.id === res);
    if (chat === undefined) throw new Error("Unable to find chat");

    (async () => {
      for await (const str of out) {
        postChatMsg(false, -1);
        chat.context += str;
      }
      updateDebounced(data, chat);

      const meta = findChatMeta(chat.context);
      if (!meta) return;
      await updateTopic({ id: chat.topicId, title: meta.title }, false);
      postChatMsg(false, -1);
      data.value.tempStore.shareEvent = { title: meta.title };
    })();

    data.value.stopChatting = chatSteam.stop;
    for await (const { context } of chatSteam) {
      push(context);
      updateDebounced(data, chat);
    }
    stop();
  } catch (error) {
  } finally {
    data.value.isProducing = false;
    data.value.isChatting = false;

    stop();
  }
};
const updateDebounced = useDebounceFn(
  (data: useChatReturn, chat: ChatData) =>
    data.value.updateChat(
      {
        context: chat.context,
        from: ChatRole.assistant,
        id: chat.id,
      },
      false,
    ),
  100,
);

const handleStopChat = () => {
  data.value.stopChatting();
  data.value.isProducing = false;
  postChatStopMsg();
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
const { $L } = useNuxtApp();
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
    title: props.topics.title || $L.chat.untitled,
  });
};

const isCollapse = defineModel<boolean>({ default: false });
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
