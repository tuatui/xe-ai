<template>
  <VDialog v-model="dialog" transition="dialog-bottom-transition" fullscreen>
    <template v-slot:activator="{ props: activatorProps }">
      <XCommonBtn
        icon
        variant="text"
        v-bind="activatorProps"
        tooltip-location="top"
        :use-tooltip="$L.common.setting"
        use-icon="i-mdi-cog"
      />
    </template>

    <VCard>
      <VToolbar>
        <VToolbarTitle>{{ $L.common.setting }}</VToolbarTitle>
        <VSpacer></VSpacer>
        <VBtn icon="i-mdi-close" @click="dialog = false"></VBtn>
      </VToolbar>

      <VList lines="two" subheader>
        <div class="max-w-[min(100%,60rem)] mxa">
          <VListSubheader>{{ $L.common.model }}</VListSubheader>

          <VListItem :title="$L.model.config" @click="isModelDialogOpen = true">
            <template v-slot:prepend>
              <VAvatar icon="i-mdi-robot" />
            </template>
            <template v-slot:append>
              <VAvatar icon="i-mdi-chevron-right" />
            </template>
          </VListItem>
          <SettingBotConfDialog v-model="isModelDialogOpen" />
          <VListItem
            :title="$L.setting.layouts.name"
            @click="isLayDialogOpen = true"
          >
            <template v-slot:prepend>
              <VAvatar icon="i-mdi-view-grid-plus-outline" />
            </template>
            <template v-slot:append>
              <VAvatar icon="i-mdi-chevron-right" />
            </template>
          </VListItem>
          <SettingLay v-model="isLayDialogOpen" />
        </div>
      </VList>
    </VCard>
  </VDialog>
</template>
<script setup lang="ts">
// TODO 超过三个对话框时，考虑改为路由实现
const dialog = ref(false);
const isModelDialogOpen = ref(false);
const isLayDialogOpen = ref(false);
</script>
