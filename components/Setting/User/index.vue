<template>
  <VDialog
    v-model="dialog"
    class="max-w-[max(30dvw,500px)]"
    :persistent="isPersistent"
  >
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
    <VScrollXReverseTransition hide-on-leave>
      <SettingUserLogin
        v-if="!isRegister"
        @close="dialog = false"
        @change="isRegister = !isRegister"
        @lock-win="isPersistent = true"
        @un-lock-win="isPersistent = false"
      />
      <SettingUserRegister
        v-if="isRegister"
        @close="dialog = false"
        @change="isRegister = !isRegister"
        @lock-win="isPersistent = true"
        @un-lock-win="isPersistent = false"
      />
    </VScrollXReverseTransition>
  </VDialog>
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
