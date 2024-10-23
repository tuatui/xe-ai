<template>
  <VDialog v-model="model" class="max-w-[max(40dvw,500px)]">
    <VCard>
      <template v-slot:title>
        <VCardTitle class="!flex items-center justify-between">
          <h3>{{ $L.setting.layouts.all }}</h3>
          <VBtn icon="i-mdi-close" variant="text" @click="model = false" />
        </VCardTitle>
      </template>
      <VList lines="two">
        <VEmptyState
          v-if="layouts.length === 0"
          :text="$L.setting.layouts.dataShowArea"
          :title="$L.setting.layouts.empTitle"
        />
        <VListItem
          v-for="layout in layouts"
          :key="layout.id"
          :title="layout.name"
          @click="openDialog(layout)"
        >
          <template v-slot:prepend>
            <VAvatar icon="i-mdi-view-grid-outline" />
          </template>
          <template v-slot:append>
            <VBtn
              variant="text"
              color="primary"
              class="font-weight-bold"
              @click.stop="handleSetCustomVt(layout)"
              >{{
                defaultBotInfo.useCustomVT !== layout.id
                  ? $L.setting.layouts.setAsDefault
                  : $L.common.cancel
              }}
            </VBtn>
          </template>
        </VListItem>
      </VList>
      <XDialog v-model="isDialogOpen" class="max-w-[max(40dvw,500px)]">
        <SettingLayDetailDialog
          :info="layout"
          @new="(n) => updateLay(n)"
          @delete="deleteLay"
          @close="isDialogOpen = false"
        />
      </XDialog>

      <template v-slot:actions>
        <div class="w-full">
          <VDivider class="w-full mb2" />
          <VListItem @click="handleSetMemoVt">
            <VListItemTitle>{{ $L.setting.layouts.memo }}</VListItemTitle>
            <template #append>
              <VSwitch
                hide-details
                @click="handleSetMemoVt"
                inset
                :model-value="!defaultBotInfo.doNotMemoVtOnUnload"
                color="primary"
              />
            </template>
          </VListItem>
          <VListItem @click="openDialog()" lines="two">
            <template v-slot:prepend>
              <VAvatar icon="i-mdi-plus" color="surface-variant" />
            </template>
            {{ $L.setting.layouts.new }}
          </VListItem>
        </div>
      </template>
    </VCard>
  </VDialog>
</template>
<script setup lang="ts">
const model = defineModel({ default: false });
const db = defaultBotStore();
const { defaultBotInfo } = storeToRefs(db);
const ls = useLayoutsStore();
const { layouts } = storeToRefs(ls);
const isDialogOpen = ref(false);
const layout = ref<VTLayoutData>();
const openDialog = (v?: VTLayoutData) => (
  (layout.value = v), (isDialogOpen.value = true)
);
const updateLay = (n: UpdateVTLayoutData) => ls.update(n);
const deleteLay = (k: number) => ls.remove(k);

const handleSetCustomVt = async (lay: VTLayoutData) => {
  if (defaultBotInfo.value.useCustomVT === lay.id)
    db.updateDefaultBotInfo({ useCustomVT: undefined });
  else
    db.updateDefaultBotInfo({
      useCustomVT: lay.id,
      vt: toRaw(lay.vt),
      doNotMemoVtOnUnload: true,
    });
};

const handleSetMemoVt = async () => {
  if (defaultBotInfo.value.doNotMemoVtOnUnload)
    db.updateDefaultBotInfo({
      doNotMemoVtOnUnload: undefined,
      useCustomVT: undefined,
    });
  else db.updateDefaultBotInfo({ doNotMemoVtOnUnload: true });
};
</script>
