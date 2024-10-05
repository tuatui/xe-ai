<template>
  <VSnackbar
    :model-value="Boolean(curr)"
    transition="slide-y-reverse-transition"
    :timeout="-1"
    location="bottom left"
  >
    {{ curr?.notification?.content }}
    <template v-slot:actions v-if="curr">
      <VBtn
        v-if="curr.notification.cancelable"
        variant="text"
        @click="curr.cancelJob()"
        color="warning"
        class="font-extrabold"
      >
        撤销
      </VBtn>
      <VBtn
        v-else
        variant="text"
        @click="curr.finishJob()"
       color="#2196F3"
        class="font-extrabold"
      >
        关闭
      </VBtn>
    </template>
  </VSnackbar>
</template>
<script setup lang="ts">
const notification = notificationStore();
const curr = computed(() => notification.notificationStack.at(0));
</script>
