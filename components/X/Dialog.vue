<template>
  <VDialog v-model="isShow" v-if="isMount" @after-leave="isMount = false">
    <slot></slot>
  </VDialog>
</template>
<script setup lang="ts">
const isShow = defineModel<boolean>();
const isMount = ref(false);

watch(isShow, async (nVal) => {
  if (nVal) isMount.value = true;
});
</script>
