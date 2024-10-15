<template>
  <div>
    <div v-if="!isEdit" class="flex justify-between items-center nav-h-root">
      <h2 class="grow v-list-item-title">{{ value }}</h2>
      <VSpeedDial submenu location="right center" transition="scale-transition">
        <template v-slot:activator="{ props: activatorProps }">
          <VBtn
            v-bind="activatorProps"
            :class="{ dialog: activatorProps['aria-expanded'] === 'false' }"
            size="small"
            icon="i-mdi-dots-vertical"
            variant="text"
            :title="$t('common.moreOptions')"
          />
        </template>
        <XCommonBtn
          key="1"
          icon
          @click="isEdit = true"
          use-icon="i-mdi-pencil"
          :use-tooltip="$t('common.edit')"
          tooltip-location="top"
        />
        <XCommonBtn
          key="2"
          icon
          color="error"
          @click="$emit('remove')"
          use-icon="i-mdi-delete"
          :use-tooltip="$t('common.delete')"
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
.nav-h-root:not(:hover, :focus) .dialog {
  opacity: 0.3;
  overflow: hidden;
  width: 0;
}
</style>
