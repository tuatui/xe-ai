<template>
  <div>
    <div v-if="!isEdit" class="flex justify-between items-center nav-h-root">
      <h2 class="grow v-list-item-title">{{ value }}</h2>
      <VSpeedDial
        open-delay="200"
        location="right center"
        transition="scale-transition"
        open-on-hover
      >
        <template v-slot:activator="{ props: activatorProps }">
          <XCommonBtn
            v-bind="activatorProps"
            :class="{ dialog: activatorProps['aria-expanded'] === 'false' }"
            size="small"
            icon
            variant="text"
            use-icon="mdi-dots-vertical"
            :use-tooltip="$t('common.moreOptions')"
          />
        </template>
        <XCommonBtn
          key="1"
          icon
          @click="isEdit = true"
          use-icon="mdi-pencil"
          :use-tooltip="$t('common.edit')"
        />
        <XCommonBtn
          key="2"
          icon
          color="error"
          @click="$emit('remove')"
          use-icon="mdi-delete"
          :use-tooltip="$t('common.delete')"
        />
      </VSpeedDial>
    </div>

    <VTextField
      v-if="isEdit"
      v-click-outside="handleUpdate"
      @click.stop
      @keydown.esc="handleEscape"
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
  (newVal) => (valueCopy.value = newVal)
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
.dialog {
  opacity: 0;
}
.nav-h-root:hover .dialog {
  opacity: 1;
}
</style>
