<template>
  <VSnackbar
    content-class="mb48px"
    :model-value="Boolean(curr)"
    transition="slide-y-reverse-transition"
    :timeout="-1"
    :location="isMobileScreen ? `bottom center` : `bottom left`"
  >
    {{ curr?.notification?.content }}
    <template v-slot:actions v-if="curr">
      <VBtn
        v-if="curr.notification.cancelable"
        variant="text"
        @click="curr.cancelJob()"
        color="surface"
        class="font-extrabold"
      >
        <span class="text-size-3.7">
          {{ $L.common.revocation }}
        </span>
      </VBtn>
      <VBtn
        class="ml2"
        v-if="curr.notification.allowClose"
        density="compact"
        icon="i-mdi-close"
        @click="curr.finishJob()"
      >
      </VBtn>
    </template>
  </VSnackbar>
</template>
<script setup lang="ts">
const {
  mobile: { isMobileScreen },
} = defaultSettingSync();
const notification = notificationStore();
const curr = computed(() => notification.notificationStack.at(0));
</script>
