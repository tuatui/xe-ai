<template>
  <div class="w-full h-full flex items-center justify-center">
    <VAppBar collapse v-if="isMobileScreen" density="comfortable">
      <template v-slot:prepend>
        <VAppBarNavIcon @click="handleToggleNav" />
      </template>

      <VAppBarTitle>{{
        data.topics[0]?.title || $L.chat.untitled
      }}</VAppBarTitle>
    </VAppBar>
    <div class="w-[min(100%,600px)] px4" :class="{ mta: isMobileScreen }">
      <VForm @submit.prevent="handleSubmit">
        <VTextField
          bg-color="primary-light"
          autofocus
          v-model="useInput"
          :placeholder
          variant="solo-filled"
          :rules="[
            () => (selectedModel === undefined ? $L.tips.needToAddModel : true),
          ]"
          rounded
          type="text"
        />
      </VForm>
      <div
        class="text-body-2 text-medium-emphasis flex justify-between items-center gap-1"
        :class="{ mb2: isMobileScreen }"
      >
        <XCommonBtn
          :ripple="false"
          icon
          :density="isMobileScreen ? `comfortable` : `compact`"
          :size="isMobileScreen ? undefined : `small`"
          rounded
          variant="text"
          @click="isDetailDialogOpen = true"
          use-icon="i-mdi-robot"
          :use-tooltip="$L.setting.addModel"
          tooltip-location="bottom"
        />
        <XCommonBtn
          :ripple="false"
          icon
          :density="isMobileScreen ? `comfortable` : `compact`"
          :size="isMobileScreen ? undefined : `small`"
          rounded
          variant="text"
          @click="handleConf"
          use-icon="i-mdi-message-settings-outline"
          :use-tooltip="$L.chat.setting"
          tooltip-location="bottom"
        />
        <XCommonBtn
          :ripple="false"
          icon
          :density="isMobileScreen ? `comfortable` : `compact`"
          :size="isMobileScreen ? undefined : `small`"
          rounded
          variant="text"
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
        v-if="isDetailDialogExist"
        v-model="isDetailDialogOpen"
        @leave="isDetailDialogExist = false"
        @new-bot-info="handleAddNewBot"
      />
    </div>
  </div>
</template>
<script setup lang="tsx">
import { LeafType } from "~/stores/chatTree";
import { chatTreeStore } from "~/stores/chatTree";
const { uniqueKey } = defineProps<{ uniqueKey: symbol }>();
const { globalSharedTabs: globalTabs } = chatTabsStore();

const data =
  globalTabs.get(uniqueKey) ||
  ref<ChatTabsData>({ topics: [], currTab: undefined, type: LeafType.welcome });

if (!globalTabs.has(uniqueKey)) globalTabs.set(uniqueKey, data);
onUnmounted(() => globalTabs.delete(uniqueKey));

const { mobile } = storeToRefs(defaultSettingSync());
const { isMobileScreen } = mobile.value;

const { defaultBotInfo } = storeToRefs(defaultBotStore());

const askText = (str?: string) => $L.action.ask(str);

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
const { $i18n } = useNuxtApp();

watch([selectedModel, $i18n.locale], ([newModel]) =>
  updatePlaceholder(newModel),
);

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
const isDetailDialogExist = ref(false);
const isDetailDialogOpen = ref(false);
watch(isDetailDialogOpen, (open) => open && (isDetailDialogExist.value = true));
const { $L } = useNuxtApp();

const handleSubmit = async () => {
  if (selectedBots.value === undefined) {
    isDetailDialogOpen.value = true;
    await nextTick();
    note({ content: $L.tips.addBotAndSelect });
    return;
  }
  if (selectedModel.value === undefined) {
    handleConf();
    await nextTick();
    note({ content: $L.tips.chooseModel });
    return;
  }
  chatTreeStore().init();

  await nextTick();
  const tab = [...globalTabs.values()].at(-1);
  if (!tab) throw new Error("The Tab just created cannot be found");

  const topic = await topicStore().updateTopic({ title: $L.chat.untitled });
  tab.value.expose?.add(topic);

  await nextTick();
  const chat = [...chatsStore().globalSharedChats.values()].at(-1);
  if (!chat) throw new Error("The Chat just created cannot be found");

  chat.value.tempStore.shareEvent = {
    initChat: {
      botData: selectedBots.value,
      modelName: selectedModel.value,
      userInput: useInput.value,
      tools: selectedBots.value.tools?.slice(0) ?? [],
    },
  };
};
const handleNewTab = async () => {
  chatTreeStore().init();

  await nextTick();
  const tab = [...globalTabs.values()].at(-1);
  if (!tab) throw new Error("The Tab just created cannot be found");

  const topic = await topicStore().updateTopic({ title: $L.chat.untitled });
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
const handleToggleNav = () => (mobile.value.showNav = !mobile.value.showNav);
</script>
