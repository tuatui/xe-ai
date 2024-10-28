<template>
  <div class="w-full h-full flex items-center justify-center">
    <div class="w-[min(100%,600px)] px4" :class="{ mta: isMobileScreen }">
      <VForm @submit.prevent="handleSubmit">
        <VTextField
          v-model="useInput"
          :placeholder
          class="![&_input]:placeholder:opacity-100"
          variant="solo-filled"
          :rules="[
            () =>
              selectedModel === undefined ? '你需要添加模型才能开始对话' : true,
          ]"
          rounded
          type="text"
        />
      </VForm>
      <div
        class="text-body-2 text-medium-emphasis flex justify-between items-center gap-1"
      >
        <XCommonBtn
          :ripple="false"
          icon
          density="compact"
          rounded
          variant="text"
          size="small"
          @click="isDetailDialogOpen = true"
          use-icon="i-mdi-robot"
          :use-tooltip="$L.setting.addModel"
          tooltip-location="bottom"
        />
        <XCommonBtn
          :ripple="false"
          icon
          density="compact"
          rounded
          variant="text"
          size="small"
          @click="handleConf"
          use-icon="i-mdi-message-settings-outline"
          :use-tooltip="$L.chat.setting"
          tooltip-location="bottom"
        />
        <XCommonBtn
          :ripple="false"
          icon
          density="compact"
          rounded
          variant="text"
          size="small"
          @click="handleNewTab"
          use-icon="i-mdi-plus"
          :use-tooltip="$L.chat.new"
          tooltip-location="bottom"
        />
        <VSpacer />

        <span>{{ selectedBots?.nickName }}</span>
        <span>{{ selectedModel }}</span>
      </div>

      <SettingBotDetailDialog
        v-if="isDetailDialogOpen"
        v-model="isDetailDialogOpen"
        @new-bot-info="handleAddNewBot"
      />
    </div>
  </div>
</template>
<script setup lang="tsx">
import { chatTreeStore } from "~/stores/chatTree";

defineProps<{ uniqueKey: symbol }>();
const {
  mobile: { isMobileScreen },
} = defaultSettingSync();
const { defaultBotInfo } = storeToRefs(defaultBotStore());

const askText = (str?: string) => `问一问 ${str || "AI"}`;

const placeholder = ref("");

const strBuf = bufferedOut("", 32);
onUnmounted(strBuf.stop);

(async () => {
  for await (const str of strBuf.out) placeholder.value += str;
})();

const updatePlaceholder = (name?: string) => {
  strBuf.clear();
  placeholder.value = "";
  strBuf.push(askText(name));
};

const selectedBots = ref<BotsData>();
const selectedModel = ref<string>();
const useInput = ref("");

watch(selectedModel, (newModel) => updatePlaceholder(newModel));

watch(
  defaultBotInfo,
  async ({ preferBotID, preferModelName }) => {
    if (preferBotID === undefined) return;

    await until(() => botsStore().bots.length).toBeTruthy();
    selectedBots.value = botsStore().bots.find((bot) => bot.id === preferBotID);
    selectedModel.value = preferModelName;
  },
  { immediate: true },
);
setTimeout(() => {
  if (selectedModel.value) return;
  updatePlaceholder();
}, 1000);

const { pushNotification: note } = notificationStore();
const isDetailDialogOpen = ref(false);

const handleSubmit = async () => {
  if (selectedBots.value === undefined) {
    isDetailDialogOpen.value = true;
    await nextTick();
    note({ content: "请先添加一个机器人并选择模型" });
    return;
  }
  if (selectedModel.value === undefined) {
    handleConf();
    await nextTick();
    note({ content: "请选择要参与对话的模型" });
    return;
  }
  chatTreeStore().init();

  await nextTick();
  const tab = [...chatTabsStore().globalSharedTabs.values()].at(-1);
  if (!tab) throw new Error("The Tab just created cannot be found");

  const topic = await topicStore().updateTopic({ title: "无标题" });
  tab.value.expose?.add(topic);

  await nextTick();
  const chat = [...chatsStore().globalSharedChats.values()].at(-1);
  if (!chat) throw new Error("The Chat just created cannot be found");

  chat.value.tempStore.shareEvent = {
    initChat: {
      botData: selectedBots.value,
      modelName: selectedModel.value,
      userInput: useInput.value,
    },
  };
};
const handleNewTab = async () => {
  chatTreeStore().init();

  await nextTick();
  const tab = [...chatTabsStore().globalSharedTabs.values()].at(-1);
  if (!tab) throw new Error("The Tab just created cannot be found");

  const topic = await topicStore().updateTopic({ title: "无标题" });
  tab.value.expose?.add(topic);
};
const handleAddNewBot = async (data: BotCreationData) => {
  const { updateBot } = botsStore();
  const res = await updateBot(data);
  if (typeof res !== "number")
    throw new Error("can not find bot after updated");

  defaultBotStore().updateDefaultBotInfo({
    preferBotID: res,
    preferModelName: data.primaryModel ?? undefined,
  });
};

const handleConf = async () => {
  const res = await topicConf()
    .showTopicConfDialog(selectedBots.value, selectedModel.value)
    .catch(() => undefined);
  if (!res) return;
  const { newBot, newModelName } = res;
  selectedBots.value = newBot;
  selectedModel.value = newModelName;
  if (newBot?.id !== undefined && newModelName)
    defaultBotStore().updateDefaultBotInfo({
      preferBotID: newBot.id,
      preferModelName: res.newModelName,
    });
};
</script>
