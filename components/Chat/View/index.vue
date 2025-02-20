<template>
  <div class="flex flex-col overflow-hidden">
    <div
      class="markdown-body h0 grow overflow-y-auto py4 contain-strict"
      @dblclick="isCollapse = false"
      ref="contentBody"
      @scroll.passive="handleScroll"
      @wheel="(ev) => ev.deltaY < 0 && (isStick2End = false)"
    >
      <article
        class="mxa px2"
        ref="article"
        :class="{
          'w-[min(100%,45rem)]': articleVerLimit,
          'w-full': !articleVerLimit,
        }"
      >
        <template v-for="(i, index) in data.chats" :key="i.id">
          <ChatContentItem
            v-if="selectedBots?.showPrompt || i.from !== ChatRole.system"
            :chat="i"
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
            <div v-once>{{ $L.tips.notMemo }}</div>
          </div>
        </template>
        <ChatViewErrorTag ref="errTag" />
      </article>
      <div class="fab-btn-wrapper">
        <div class="h48px">
          <VFab
            :title="$L.chat.scrollToBottom"
            class="w-full justify-end"
            :active="!isStick2End"
            @click="handleScroll2End"
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
        <VDivider />
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
          @keydown.enter="
            (e: KeyboardEvent) => {
              if (e.ctrlKey === !ds.setting.enterToSend) updateHandle();
              else if (e.ctrlKey) {
                const pos = (e.target as HTMLTextAreaElement).selectionEnd ?? 0;
                userInput = `${userInput.slice(0, pos)}\n${userInput.slice(pos)}`;
                nextTick(
                  () =>
                    ((e.target as HTMLTextAreaElement).selectionEnd = pos + 1),
                );
              }
            }
          "
        />
        <VDivider />
        <div
          class="bg-surface-light h-48px flex items-center px1 gap1 flex-wrap overflow-hidden"
        >
          <div class="h-full w0"></div>
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
            use-icon="i-mdi-arrow-collapse-vertical"
            :use-tooltip="$L.chat.collapse"
            tooltip-location="top"
          />
          <XCommonBtn
            icon
            density="comfortable"
            rounded
            variant="text"
            @click="articleVerLimit = !articleVerLimit"
            :use-icon="
              articleVerLimit
                ? 'i-mdi-monitor-screenshot'
                : 'i-mdi-cellphone-screenshot'
            "
            :use-tooltip="
              articleVerLimit ? $L.chat.noVerLimit : $L.chat.verLimit
            "
            tooltip-location="top"
          />
          <VSpacer />
          <div class="text-size-xs pr1" v-if="!ds.mobile.isMobileScreen">
            <template v-if="ds.setting.enterToSend">
              <p class="mb0.5"><VKbd>ENTER</VKbd> {{ $L.chat.send }}</p>
              <p>
                <VKbd>CTRL</VKbd> <VKbd>ENTER</VKbd> {{ $L.common.lineBreak }}
              </p>
            </template>
            <template v-else>
              <p class="mb0.5">
                <VKbd>CTRL</VKbd> <VKbd>ENTER</VKbd> {{ $L.chat.send }}
              </p>
              <p><VKbd>ENTER</VKbd> {{ $L.common.lineBreak }}</p>
            </template>
          </div>
          <div class="text-body-2 text-medium-emphasis ellipsis-text pr1">
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
import type { ChatViewErrorTag } from "#build/components";

const props = defineProps<{ topics: TopicData }>();
const emit = defineEmits<{ updateTitle: [newTitle: string]; close: [] }>();
const userInput = ref("");
const { globalSharedChats, postWinMessage } = chatsStore();
const { updateTopic } = topicStore();
const ds = defaultSettingSync();
const errTag = ref<InstanceType<typeof ChatViewErrorTag>>();

const data =
  globalSharedChats.get(props.topics.id) || useChats(props.topics.id);

if (!globalSharedChats.has(props.topics.id)) {
  globalSharedChats.set(props.topics.id, data);
  data.value.chatRefCount = 1;
} else data.value.chatRefCount++;

onUnmounted(() => {
  if (data.value.chatRefCount === 1) {
    setTimeout(() => {
      if (data.value.chatRefCount > 1) {
        data.value.chatRefCount--;
        return;
      }
      globalSharedChats.delete(props.topics.id);
      data.value.chatRefCount = 0;
    });
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
  },
  { immediate: true },
);

watch(selectedBots, () => (chatSession = null), { deep: true });

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
    await updateTopic({
      id: props.topics.id,
      preferSetting: {
        preferBotID: res.newBot?.id,
        preferModelName: res.newModelName,
      },
    });
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
const isCollapse = defineModel<boolean>({ default: false });
const chatInputArea = ref<HTMLElement | null>(null);
const inputAreaHeight = defineModel<number>("inputHeight", { default: 201 });
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
        el.scrollHeight - 63 /* 为了不占满空间 */,
      );
      inputAreaHeight.value = Math.max(targetMinHeight, 102);
      if (!isStick2End.value) return;
      nextTick().then(() => {
        if (!contentBody.value) return;
        scrollToEnd(contentBody.value, { behavior: "instant" });
      });
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
    isStick2End.value = true;
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
  errTag.value?.clear();
  if (!selectedBots.value || selectedModel.value === undefined) return;
  if (data.value.isProducing || data.value.isChatting) return;

  if (
    data.value.chats.length === 0 &&
    selectedBots.value.promptType !== BotPrompt2Use.noPrompt
  ) {
    const prompt =
      selectedBots.value.promptType !== BotPrompt2Use.custom
        ? chatMetaExamplePrompt
        : selectedBots.value.prompt;
    if (prompt) {
      await data.value.updateChat({
        context: prompt,
        from: ChatRole.system,
        provider: selectedBots.value.provider,
      });
      postChatMsg(true, -1);
    }
  }

  if (userInput.value) {
    let context: string;
    if (ds.setting.useFullMDinput) context = userInput.value;
    else {
      const temp = document.createElement("div");
      temp.innerText = userInput.value;
      context = temp.innerHTML;
    }

    await data.value.updateChat({
      context,
      from: ChatRole.user,
      provider: selectedBots.value.provider,
    });
    postChatMsg(true, -1);
    userInput.value = "";
  }

  nextTick().then(() => {
    contentBody.value &&
      scrollToEnd(contentBody.value, { behavior: "instant" });
  });

  try {
    data.value.isChatting = true;
    postChatMsg(false, -1);
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

    const sessionChatsData = data.value.chats.slice(-chatLimit);
    const currChatSessionProvider = selectedBots.value.provider;
    if (
      selectedBots.value.addPromptEveryTime &&
      sessionChatsData[0].from !== ChatRole.system &&
      data.value.chats[0].from === ChatRole.system
    )
      sessionChatsData.unshift(data.value.chats[0]);
    const chatSteam = chatSession.createChat(
      sessionChatsData,
      selectedModel.value,
    );

    data.value.stopChatting = chatSteam.stop;
    data.value.isProducing = true;

    const sessionCtx: {
      chatData: ChatData;
      update: (delta: ChatChunk["delta"]) => void;
      remove: () => void;
      reasoningBuff?: BufferedOut;
      contextBuff?: BufferedOut;
    }[] = [];
    for await (const { finish_reason, index, delta } of chatSteam) {
      if (sessionCtx[index]) sessionCtx[index].update(delta);
      else {
        const nid = await data.value.updateChat({
          provider: currChatSessionProvider,
          ...structuredClone(delta),
        });
        postChatMsg(false, -1);
        const cIndex = index;
        sessionCtx[index] = {
          chatData: data.value.chats.findLast(({ id }) => id === nid)!,
          update: (delta) => {
            const ctx = sessionCtx[cIndex];
            if (delta.context) {
              if (!ctx.contextBuff) {
                ctx.contextBuff = bufferedOut();
                const out = ctx.contextBuff.out;
                (async () => {
                  for await (const str of out) {
                    postChatMsg(false, -1);
                    ctx.chatData.context += str;
                  }
                  updateDebounced(data, ctx.chatData, currChatSessionProvider);
                  const meta = findChatMeta(ctx.chatData.context);
                  if (!meta) return;
                  await updateTopic(
                    { id: ctx.chatData.topicId, title: meta.title },
                    false,
                  );
                  postChatMsg(false, -1);
                  data.value.tempStore.shareEvent = { title: meta.title };
                })();
              }
              ctx.contextBuff.push(delta.context);
            }
            if (delta.reasoningContent) {
              if (!ctx.reasoningBuff) {
                ctx.reasoningBuff = bufferedOut();
                const rOut = ctx.reasoningBuff.out;
                (async () => {
                  for await (const str of rOut) {
                    ctx.chatData.reasoningContent ??= "";
                    ctx.chatData.reasoningContent += str;
                    postChatMsg(false, -1);
                  }
                  updateDebounced(data, ctx.chatData, currChatSessionProvider);
                })();
              }
              ctx.reasoningBuff.push(delta.reasoningContent);
            }
            if (delta.toolCalls) {
              ctx.chatData.toolCalls ??= [];
              for (const toolCall of delta.toolCalls) {
                const index = toolCall.index;
                if (!ctx.chatData.toolCalls[index])
                  ctx.chatData.toolCalls[index] = { ...toolCall };
                else ctx.chatData.toolCalls[index].arg += toolCall.arg;
              }
              postChatMsg(false, -1);
              updateDebounced(data, ctx.chatData, currChatSessionProvider);
            }
          },
          remove: () => {
            const ctx = sessionCtx[cIndex];
            ctx.contextBuff?.stop();
            ctx.contextBuff = undefined;
            ctx.reasoningBuff?.stop();
            ctx.reasoningBuff = undefined;
          },
        };
      }
      if (finish_reason) sessionCtx[index].remove();
    }
    sessionCtx.forEach((each) => each.remove());
  } catch (error: any) {
    let msg = error?.message ?? JSON.stringify(error);
    if (error.stack) msg += `\n${error.stack}`;
    errTag.value?.push(error?.code ?? "Error", msg);
  } finally {
    data.value.isProducing = false;
    data.value.isChatting = false;
    postChatMsg(false, -1);
  }
};
const updateDebounced = useDebounceFn(
  (data: useChatReturn, chat: ChatData, provider: Provider) =>
    data.value.updateChat(
      {
        context: chat.context,
        from: ChatRole.assistant,
        id: chat.id,
        reasoningContent: chat.reasoningContent,
        provider,
        toolCalls: chat.toolCalls,
        toolCallId: chat.toolCallId,
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
const article = ref<HTMLElement>();
let ignoreNextScrollEv = false;
const articleResizeObz = new ResizeObserver(() => {
  if (!contentBody.value || !isStick2End.value) return;
  scrollToEnd(contentBody.value, { behavior: "instant" });
  ignoreNextScrollEv = true;
});
onMounted(() => article.value && articleResizeObz.observe(article.value));
onUnmounted(() => articleResizeObz.disconnect());

const isStick2End = ref(true);
const handleScroll = (ev: Event) => {
  if (ignoreNextScrollEv) {
    ignoreNextScrollEv = false;
    return;
  }
  const target = ev.target as HTMLDivElement;
  isStick2End.value =
    Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 20;
  handleUpdateScrollStatus();
};

const handleScroll2End = () => {
  if (!contentBody.value) return;
  if (!data.value.isChatting) scrollToEnd(contentBody.value);
  else {
    scrollToEnd(contentBody.value, { behavior: "instant" });
    isStick2End.value = true;
  }
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

const articleVerLimit = ref(true);
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
  [dir="rtl"] & {
    transform: translateX(100%) scale(0.5);
  }
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
.fab-btn-wrapper {
  position: sticky;
  bottom: 0;

  display: flex;
  justify-content: flex-end;
  align-items: flex-end;

  width: min(100%, calc(52rem));
  height: 0;

  margin: 0 auto;
  padding: 0 0.5rem;
}
</style>
