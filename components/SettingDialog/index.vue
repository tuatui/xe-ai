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

      <VList lines="two" subheader>
        <div class="max-w-[min(100%,60rem)] mxa">
          <VListSubheader>模型</VListSubheader>

          <VListItem title="配置模型" @click="isModelDialogOpen = true">
            <template v-slot:append>
              <VAvatar icon="mdi-chevron-right" />
            </template>
          </VListItem>
          <SettingDialogBotConfDialog v-model="isModelDialogOpen" />
        </div>
      </VList>
    </VCard>
  </VDialog>
</template>
<script setup lang="ts">
const dialog = ref(false);
const isModelDialogOpen = ref(false);
</script>
