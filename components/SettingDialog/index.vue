<template>
  <VDialog v-model="dialog" transition="dialog-bottom-transition" fullscreen>
    <template v-slot:activator="{ props: activatorProps }">
      <VBtn
        icon
        variant="text"
        v-bind="activatorProps"
        :aria-label="$t('common.setting')"
      >
        <VIcon icon="mdi-cog" />
        <VTooltip
          activator="parent"
          location="top"
          :aria-label="$t('common.setting')"
          >{{ $t("common.setting") }}</VTooltip
        >
      </VBtn>
    </template>

    <VCard>
      <VToolbar>
        <VToolbarTitle>{{ $t("common.setting") }}</VToolbarTitle>
        <VSpacer></VSpacer>
        <VBtn icon="mdi-close" @click="dialog = false"></VBtn>
      </VToolbar>

      <VList lines="two" subheader>
        <div class="max-w-[min(100%,60rem)] mxa">
          <VListSubheader>{{ $t("common.model") }}</VListSubheader>

          <VListItem
            :title="$t('module.config')"
            @click="isModelDialogOpen = true"
          >
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
