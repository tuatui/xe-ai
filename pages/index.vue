<template>
  <VLayout>
    <XNav />
    <VMain class="max-h-100dvh">
      <AdjustableView v-model="tree" />
    </VMain>
  </VLayout>
</template>
<script setup lang="tsx">
import { chatTreeStore } from "~/stores/chatTree";

const { tree } = storeToRefs(chatTreeStore());
</script>
