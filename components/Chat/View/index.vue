isDisabled: true
<template>
  <div class="flex flex-col overflow-hidden">
    <div
      class="markdown-body h0 grow overflow-y-auto py4 contain-strict"
      ref="contentBody"
      @scroll.passive="handleScroll"
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
          <div v-if="index === memoIdx" role="separator" class="text-center h0">
            <div v-once class="bg-surface-light text-body-2 rounded">
              {{ $L.tips.notMemo }}
            </div>
          </div>
          <ChatContent
            v-if="selectedBots?.showPrompt || i.from !== ChatRole.system"
            :chat="i"
          />
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
          :placeholder="$L.chat.inputTips"
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
            @click="updateHandle()"
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
          <XCommonBtn
            icon
            density="comfortable"
            rounded
            variant="text"
            @click="retry"
            use-icon="i-mdi-cached"
            :use-tooltip="$L.common.retry"
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
          <template
            v-if="
              selectedBots?.provider !== undefined && selectedBots.tools?.length
            "
          >
            <ChatViewToolBar
              :server="Services[selectedBots.provider]"
              :bot-tool-names="selectedBots.tools"
              v-model:model-value="selectedTools"
              @update:model-value="handleUpdateTools"
            />
          </template>
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
const selectedTools = ref<string[]>();
const isBotReady = computed(
  () => selectedBots.value !== undefined && selectedModel.value !== undefined,
);

const { chatSetting } = data.value.tempStore;
if (chatSetting) {
  selectedBots.value = chatSetting.useBotData;
  selectedModel.value = chatSetting.useModelName;
  selectedTools.value = chatSetting.useTools;
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
      const bot = botsStore().bots.find((bot) => bot.id === conf.preferBotID);

      data.value.tempStore.chatSetting = {
        useBotData: bot,
        useModelName: bot?.availableModel.find(
          ({ name }) => name === conf.preferModelName,
        )
          ? conf.preferModelName
          : undefined,
        useTools: [...new Set(conf.tools).intersection(new Set(bot?.tools))],
      };
    },
    { immediate: true },
  );

let chatSession: ChatSession | undefined | null;
const { Services } = chatServices();

watch(
  () => data.value.tempStore.chatSetting,
  async (newSetting) => {
    if (!newSetting) return;
    selectedBots.value = newSetting.useBotData;
    selectedModel.value = newSetting.useModelName;
    if (newSetting.useTools) selectedTools.value = newSetting.useTools;
  },
  { immediate: true, deep: true },
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
      selectedTools.value = init.tools;
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
    const tools = [
      ...new Set(selectedTools.value).intersection(new Set(res.newBot?.tools)),
    ];
    data.value.tempStore.chatSetting = {
      useBotData: res.newBot,
      useModelName: res.newModelName,
      useTools: tools,
    };
    await updateTopic({
      id: props.topics.id,
      preferSetting: {
        preferBotID: res.newBot?.id,
        preferModelName: res.newModelName,
        tools,
      },
    });
    postWinMessage({
      updateSetting: {
        topicId: props.topics.id,
        setting: {
          useBotData: toRaw(res.newBot),
          useModelName: res.newModelName,
          useTools: tools,
        },
      },
    });
  } catch (error) {
    if (error) console.warn(error);
  }
};
const handleUpdateTools = async (newTools: string[]) => {
  data.value.tempStore.chatSetting ??= {};
  data.value.tempStore.chatSetting.useTools = newTools;
  await updateTopic(
    {
      id: props.topics.id,
      preferSetting: { tools: newTools },
    },
    true,
  );
  postWinMessage({
    updateSetting: {
      topicId: props.topics.id,
      setting: { useTools: newTools },
    },
  });
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

const syncStatus = () =>
  postWinMessage({
    syncChatStatus: {
      isProducing: data.value.isProducing,
      topicId: props.topics.id,
      isChatting: data.value.isChatting,
    },
  });
const postChatStopMsg = () =>
  postWinMessage({ stopChat: { topicId: props.topics.id } });

const updateHandle = async (ignoreUserInput?: boolean) => {
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
    }
  }

  const chatTruncateIdx =
    selectedBots.value?.memoCount === undefined
      ? 0
      : calcChatRound(data.value.chats, selectedBots.value.memoCount);

  if (!ignoreUserInput && userInput.value) {
    await data.value.updateChat({
      context: userInput.value,
      from: ChatRole.user,
      provider: selectedBots.value.provider,
      noMarkdownRender: !ds.setting.useFullMDinput,
    });
    userInput.value = "";
  }

  nextTick().then(() => {
    contentBody.value &&
      scrollToEnd(contentBody.value, { behavior: "instant" });
  });

  const sessionCtx: {
    chatData: ChatData;
    update: (delta: ChatChunk["delta"]) => void;
    remove: () => void;
    reasoningBuff?: BufferedOut;
    contextBuff?: BufferedOut;
  }[] = [];

  try {
    data.value.isChatting = true;
    syncStatus();
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

    const sessionChatsData = data.value.chats
      .slice(chatTruncateIdx)
      .filter(({ isDisabled }) => !isDisabled);

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
      {
        toolNames: selectedTools.value,
        exConf: selectedBots.value.exSessionConf,
      },
    );

    data.value.stopChatting = chatSteam.stop;
    data.value.isProducing = true;
    syncStatus();

    for await (const { finish_reason, index, delta } of chatSteam) {
      if (sessionCtx[index]) sessionCtx[index].update(delta);
      else {
        delta.status = ChatStatus.generating;
        const nid = await data.value.updateChat({
          provider: currChatSessionProvider,
          ...cloneDeep(delta),
        });
        const cIndex = index;
        sessionCtx[index] = {
          chatData: data.value.chats.findLast(({ id }) => id === nid)!,
          update: (delta) => {
            const ctx = sessionCtx[cIndex];
            if (delta.context) {
              if (!ctx.contextBuff) {
                ctx.contextBuff = bufferedOut();
                const out = ctx.contextBuff.out;
                if (ctx.reasoningBuff) ctx.reasoningBuff.duration = 500;
                (async () => {
                  for await (const str of out) {
                    ctx.chatData.context += str;
                    updateDebounced(data, ctx.chatData);
                  }
                  ctx.chatData.finishReason = delta.finishReason;
                  ctx.chatData.status = ChatStatus.finish;
                  updateDebounced(data, ctx.chatData);
                  const meta = findChatMeta(ctx.chatData.context);
                  if (!meta) return;

                  await updateTopic(
                    {
                      id: ctx.chatData.topicId,
                      title: meta.title,
                    },
                    false,
                  );
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
                    updateDebounced(data, ctx.chatData);
                  }
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

              updateDebounced(data, ctx.chatData);
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
  } catch (error: any) {
    let msg = error?.message ?? JSON.stringify(error);
    if (error.stack) msg += `\n${error.stack}`;
    errTag.value?.push(error?.code ?? "Error", msg);
  } finally {
    data.value.isProducing = false;
    data.value.isChatting = false;
    sessionCtx.forEach((each) => each.remove());
    syncStatus();
  }
};
const updateDebounced = useDebounceFn(
  (data: useChatReturn, chat: ChatData) => data.value.updateChat(chat, false),
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

const calcChatRound = (chats: ChatData[], count: number): number => {
  if (count === 0) return chats.length;
  for (let index = chats.length - 1; index >= 0; index--) {
    const chat = chats[index];
    if (chat.from === ChatRole.user) count--;
    if (count <= 0) return index;
  }
  return 0;
};

const memoIdx = ref<number>();
watch(
  [() => selectedBots.value?.memoCount, () => data.value.chats.length],
  ([newVal]) => {
    if (newVal === undefined) {
      memoIdx.value = undefined;
      return;
    }
    const idx = calcChatRound(data.value.chats, newVal);
    memoIdx.value = idx === 0 ? undefined : idx;
  },
);

// TODO: 我草怎么拉这么多了😅，得拆组件了
const retry = async () => {
  const assistChatIdx = data.value.chats.findLastIndex(
    ({ from, isDisabled }) => from === ChatRole.assistant && !isDisabled,
  );
  if (assistChatIdx < 0) {
    notificationStore().pushNotification({
      content: $L.tips.noChatCtx,
      timeout: 3000,
      allowClose: true,
    });
    return;
  }

  const assistChat = data.value.chats[assistChatIdx];
  await data.value.updateChat({ ...assistChat, isDisabled: true });
  if (assistChat.toolCalls) {
    const toolCallIdSet = new Set(assistChat.toolCalls.map(({ id }) => id));
    await Promise.all(
      data.value.chats
        .slice(assistChatIdx)
        .filter(({ toolCallId }) => toolCallId && toolCallIdSet.has(toolCallId))
        .map((chat) => data.value.updateChat({ ...chat, isDisabled: true })),
    );
  }

  updateHandle(true);
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
