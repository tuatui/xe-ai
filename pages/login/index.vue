<template>
  <div class="w-full h-full flex bg-#f0f4f9">
    <div class="w-full max-w-[460px] ma">
      <!-- <VDialog v-model="dialog" :persistent="isPersistent">
    <template v-slot:activator="{ props: activatorProps }">
      <XCommonBtn
        icon
        variant="text"
        v-bind="activatorProps"
        tooltip-location="top"
        :use-tooltip="$t('setting.user')"
      >
        <VBadge
          :model-value="login.isLogin"
          color="success"
          dot
          location="bottom right"
        >
          <VIcon icon="mdi-account-circle" />
        </VBadge>
      </XCommonBtn>
    </template>
  </VDialog> -->
      <VScrollXReverseTransition hide-on-leave>
        <UserLogin
          v-if="!isRegister"
          @close="dialog = false"
          @change="isRegister = !isRegister"
          @lock-win="isPersistent = true"
          @un-lock-win="isPersistent = false"
        />
        <UserRegister
          v-if="isRegister"
          @close="dialog = false"
          @change="isRegister = !isRegister"
          @lock-win="isPersistent = true"
          @un-lock-win="isPersistent = false"
        />
      </VScrollXReverseTransition>
    </div>
  </div>
</template>
<script setup lang="ts">
const dialog = ref(false);
const isPersistent = ref(false);
const login = loginStore();

watch(dialog, (isShow) => {
  if (!isShow) nextTick().then(() => (isRegister.value = false));
});
const isRegister = ref(false);
</script>
