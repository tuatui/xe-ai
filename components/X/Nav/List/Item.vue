<template>
  <div>
    <div v-if="!isEdit" class="flex justify-between items-center nav-h-root">
      <h2 class="grow v-list-item-title" tabindex="0">{{ value }}</h2>
      <VSpeedDial
        submenu
        location="right center"
        transition="scale-transition"
        v-model="isShow"
      >
        <template v-slot:activator="{ props }">
          <VBtn
            v-bind="props"
            :class="{ dialog: !isShow }"
            size="small"
            icon="i-mdi-dots-vertical"
            variant="text"
            :title="$L.common.moreOptions"
          />
        </template>
        <XCommonBtn
          key="1"
          icon
          :tabindex="isShow ? 0 : -1"
          @click="isEdit = true"
          use-icon="i-mdi-pencil"
          :use-tooltip="$L.common.edit"
          tooltip-location="top"
        />
        <XCommonBtn
          key="2"
          icon
          :tabindex="isShow ? 0 : -1"
          color="error"
          @click="$emit('remove')"
          use-icon="i-mdi-delete"
          :use-tooltip="$L.common.delete"
          tooltip-location="top"
        />
      </VSpeedDial>
    </div>

    <VTextField
      v-if="isEdit"
      :autofocus="isEdit"
      v-click-outside="handleUpdate"
      @click.stop
      @keydown.enter.stop="handleUpdate"
      @keydown.esc.tab="handleEscape"
      variant="outlined"
      v-model="valueCopy"
      hide-details
      density="compact"
    />
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  value: string;
}>();
const emit = defineEmits<{
  remove: [];
  update: [newVal: string];
}>();
const isShow = ref<boolean>(false);
const valueCopy = ref(props.value);
watch(
  () => props.value,
  (newVal) => (valueCopy.value = newVal),
);
const handleUpdate = () => {
  if (!valueCopy.value) valueCopy.value = props.value;
  else if (valueCopy.value !== props.value) emit("update", valueCopy.value);
  isEdit.value = false;
};
const handleEscape = () => {
  valueCopy.value = props.value;
  isEdit.value = false;
};
const isEdit = ref(false);
</script>
<style lang="css">
.nav-h-root:not(:hover, :focus) .v-btn:not(:focus).dialog {
  overflow: hidden;
  width: 0;
}
</style>
