<template>
  <VLayout class="max-h-100dvh">
    <XNav />
    <VMain>
      <AdjustableView v-model="tree" />
    </VMain>
  </VLayout>
</template>
<script setup lang="tsx">
import { chatTreeStore } from "~/stores/chatTree";

const { tree } = storeToRefs(chatTreeStore());
</script>
