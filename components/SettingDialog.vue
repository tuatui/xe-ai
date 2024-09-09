<template>
  <VDialog v-model="dialog" transition="dialog-bottom-transition" fullscreen>
    <template v-slot:activator="{ props: activatorProps }">
      <VBtn icon="mdi-cog" variant="text" v-bind="activatorProps" />
    </template>

    <VCard>
      <VToolbar>
        <VToolbarTitle>设置</VToolbarTitle>
        <VSpacer></VSpacer>
        <VBtn icon="mdi-close" @click="dialog = false"></VBtn>
      </VToolbar>
      <VDialog v-model="isBotsInfoDialogOpen" class="max-w-[max(40dvw,500px)]">
        <VForm @submit.prevent>
          <VCard title="编辑">
            <VCardText>
              <VTextField v-model="botsInfo.nick_name" label="名字" />
              <VTextField
                v-model="botsInfo.secret_key"
                type="password"
                label="24位密钥"
              />
            </VCardText>

            <VCardActions>
              <VSpacer></VSpacer>
              <VBtn
                text="取消"
                variant="tonal"
                @click="isBotsInfoDialogOpen = false"
              />
              <VBtn
                type="submit"
                color="primary"
                text="提交"
                variant="flat"
                @click="updateBotsHandle"
              />
            </VCardActions>
          </VCard>
        </VForm>
      </VDialog>
      <VList lines="two" subheader>
        <VListSubheader>机器人</VListSubheader>

        <VListItem
          v-for="bot in bots"
          subtitle="OpenAI GPT-3.5"
          :title="bot.nick_name"
          @click="openDialog(bot)"
        >
          <template v-slot:prepend>
            <VAvatar icon="mdi-robot" />
          </template>
        </VListItem>
        <VListItem title="新增聊天机器人" @click="openDialog()">
          <template v-slot:prepend>
            <VAvatar icon="mdi-plus" />
          </template>
        </VListItem>
      </VList>
    </VCard>
  </VDialog>
</template>
<script setup lang="ts">
const dialog = ref(false);
const isBotsInfoDialogOpen = ref(false);
const createBotsInfo = (): Partial<BotsData> => ({
  nick_name: "",
  secret_key: "",
  name: "chat-gpt-3.5",
});
const botsInfo = ref(createBotsInfo());
const openDialog = (data?: BotsData) => {
  botsInfo.value = data ? structuredClone(data) : createBotsInfo();
  isBotsInfoDialogOpen.value = true;
};
const updateBotsHandle = async () => {
  await updateBot(botsInfo.value);
  isBotsInfoDialogOpen.value = false;
};
const { bots, updateBot } = useBots();
</script>
