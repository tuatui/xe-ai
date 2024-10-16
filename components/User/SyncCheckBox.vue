<template>
  <VCheckbox
    :label="$L.tips.syncTmpChatLabel"
    color="primary"
    v-model="isChecked"
    :disabled="disabled"
    hide-details
  />
  <VExpandTransition>
    <p class="text-body-2 text-medium-emphasis" v-show="!isChecked">
      {{ $L.tips.syncTmpChat }}
    </p>
  </VExpandTransition>
</template>
<script setup lang="ts">
const isChecked = defineModel<boolean>();
defineProps<{ disabled?: boolean }>();
</script>
