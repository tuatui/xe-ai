<template>
  <VDialog v-model="model" class="max-w-[max(40dvw,700px)]">
    <VCard>
      <template v-slot:title>
        <VCardTitle class="!flex items-center justify-between">
          <h3>{{ $L.common.allModels }}</h3>
          <VBtn icon="i-mdi-close" variant="text" @click="model = false" />
        </VCardTitle>
      </template>
      <VList lines="two">
        <VEmptyState
          v-if="bots.length === 0"
          :text="$L.setting.botShowArea"
          :title="$L.setting.noBotTitle"
        />
        <VListItem
          v-for="bot in bots"
          :key="bot.id"
          :subtitle="formatTitle(bot)"
          :title="bot.nickName"
          @click="openDialog(bot)"
        >
          <template v-slot:prepend>
            <VAvatar>
              <component :is="Services[bot.provider]?.info?.icon" />
            </VAvatar>
          </template>
          <template v-slot:append>
            <VBtn
              variant="text"
              :color="preferBotID === bot.id ? undefined : 'primary'"
              class="font-weight-bold"
              :disabled="preferBotID === bot.id"
              @click.stop="updateSetting(bot)"
              >{{
                preferBotID === bot.id
                  ? $L.setting.defaultModule
                  : $L.setting.setDefault
              }}</VBtn
            >
          </template>
        </VListItem>
      </VList>

      <SettingBotDetailDialog
        v-model="isBotsInfoDialogOpen"
        :bot-info="botsInfo"
        @new-bot-info="
          (n) => {
            updateBot(n);
            if (n.id === undefined || !n.primaryModel) return;
            if (n.id !== preferBotID) return;
            updateSetting(n as BotsData);
          }
        "
        @delete="deleteBot"
      />
      <template v-slot:actions>
        <div class="w-full">
          <VDivider class="w-full mb2" />
          <VListItem @click="openDialog()" lines="two">
            <template v-slot:prepend>
              <VAvatar icon="i-mdi-plus" color="surface-variant" />
            </template>
            {{ $L.setting.addModel }}
          </VListItem>
        </div>
      </template>
    </VCard>
  </VDialog>
</template>
<script setup lang="ts">
const model = defineModel({ default: false });
const { bots, updateBot, deleteBot } = botsStore();
const dBot = defaultBotStore();
const preferBotID = computed(() => dBot.defaultBotInfo.preferBotID);
const isBotsInfoDialogOpen = ref(false);
const { Services } = chatServices();
const botsInfo = ref<BotCreationData>();
const openDialog = (data?: BotsData) => {
  botsInfo.value = data;
  isBotsInfoDialogOpen.value = true;
};

const formatTitle = (bot: BotCreationData) => {
  let title = "";
  if (bot.provider !== undefined) {
    const info = Services[bot.provider]?.info;
    if (info) title += info.provider + " ";
  }

  if (bot.secretKey !== undefined) title += hidePartialStr(bot.secretKey);
  return title;
};
const updateSetting = (
  bot: Pick<BotsData, "id" | "primaryModel" | "tools">,
) => {
  dBot.updateDefaultBotInfo({
    preferBotID: bot.id,
    preferModelName: bot.primaryModel ?? undefined,
    tools: bot.tools,
  });
};
</script>
