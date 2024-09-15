<template>
  <VDialog v-model="model" class="max-w-[max(40dvw,500px)]">
    <VCard>
      <VList lines="two">
        <VListItem
          v-for="bot in bots"
          :subtitle="formatTitle(bot)"
          :title="bot.nick_name"
          @click="openDialog(bot)"
        >
          <template v-slot:prepend>
            <VAvatar>
              <component :is="Services[bot.provider]?.info?.icon" />
            </VAvatar>
          </template>
        </VListItem>
      </VList>

      <SettingDialogBotDetialDialog
        v-model="isBotsInfoDialogOpen"
        :bot-info="botsInfo"
        @new-bot-info="(n) => updateBot(n)"
      />
    </VCard>
  </VDialog>
</template>
<script setup lang="ts">
const model = defineModel({ default: false });
const { bots, updateBot } = useBots();
const isBotsInfoDialogOpen = ref(false);

const botsInfo = ref<Partial<BotsData>>();
const openDialog = (data?: BotsData) => {
  botsInfo.value = data;
  isBotsInfoDialogOpen.value = true;
};

const formatTitle = (bot: Partial<BotsData>) => {
  let title = "";
  if (bot.provider !== undefined) {
    const info = Services[bot.provider]?.info;
    if (info) title += info.provider + " ";
  }

  if (bot.secret_key !== undefined) title += hideParticalStr(bot.secret_key);
  return title;
};
</script>
