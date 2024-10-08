<template>
  <VDialog v-model="model" class="max-w-[max(40dvw,700px)]">
    <VCard>
      <template v-slot:title>
        <VCardTitle class="!flex items-center justify-between">
          <h3>{{ $t("common.allModels") }}</h3>
          <VBtn icon="mdi-close" variant="text" @click="model = false" />
        </VCardTitle>
      </template>
      <VList lines="two">
        <VEmptyState
          v-if="bots.length === 0"
          :text="$t('setting.botShowArea')"
          :title="$t('setting.noBotTitle')"
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
              @click.stop="dBot.updateDefaultBotInfo({ preferBotID: bot.id })"
              >{{
                preferBotID === bot.id
                  ? $t("setting.defaultModule")
                  : $t("setting.setDefault")
              }}</VBtn
            >
          </template>
        </VListItem>
      </VList>

      <SettingBotDetailDialog
        v-model="isBotsInfoDialogOpen"
        :bot-info="botsInfo"
        @new-bot-info="(n) => updateBot(n)"
        @delete="deleteBot"
      />
      <template v-slot:actions>
        <div class="w-full">
          <VDivider class="w-full mb2" />
          <VListItem @click="openDialog()" lines="two">
            <template v-slot:prepend>
              <VAvatar icon="mdi-plus" color="surface-variant" />
            </template>
            {{ $t("setting.addModel") }}
          </VListItem>
        </div>
      </template>
    </VCard>
  </VDialog>
</template>
<script setup lang="ts">
const model = defineModel({ default: false });
const { bots, updateBot, deleteBot } = useBots();
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
</script>
