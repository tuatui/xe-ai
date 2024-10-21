<template>
  <VForm @submit.prevent="handleSubmit">
    <VCard>
      <template v-slot:title>
        <VCardTitle class="!flex items-center justify-between">
          <h3>{{ $L.common.login }}</h3>
        </VCardTitle>
      </template>
      <VCardText>
        <VTextField
          class="mb3"
          variant="outlined"
          autocomplete="username"
          :label="$L.common.account"
          v-model="form.name"
          :disabled="isSubmitting"
          :error-messages="loginErrMsg"
          :rules="[(str) => (str ? true : $L.tips.mustExist)]"
        />
        <XInputPwd
          autocomplete="current-password"
          variant="outlined"
          :label="$L.common.password"
          v-model="form.password"
          :disabled="isSubmitting"
          :error-messages="loginErrMsg ? ' ' : undefined"
          :rules="[(str) => (str ? true : $L.tips.mustExist)]"
        />
        <p class="text-body-2 text-medium-emphasis">
          {{ $L.tips.loginAndSync }}
        </p>
        <UserSyncCheckBox v-model="form.syncAll" :disabled="isSubmitting" />
      </VCardText>
      <VDivider />
      <VCardActions>
        <I18nSwitch />
        <VSpacer />
        <VBtn
          size="large"
          type="submit"
          color="primary"
          :text="$L.common.register"
          @click="$emit('change')"
          :disabled="isSubmitting"
        />
        <VBtn
          size="large"
          type="submit"
          color="primary"
          :text="$L.common.login"
          variant="elevated"
          :disabled="isSubmitting"
        />
      </VCardActions>
    </VCard>
  </VForm>
</template>
<script setup lang="ts">
import type { SubmitEventPromise } from "vuetify";
import { VTextField } from "vuetify/components";
const emit = defineEmits<{
  change: [];
  success: [sync: boolean];
}>();
const $client = useNuxtApp().$client;
const createLoginForm = () => ({
  name: "",
  password: "",
  syncAll: true,
});
const { $L } = useNuxtApp();
const form = ref(createLoginForm());

const isSubmitting = ref(false);

const loginErrMsg = ref<string>();
const handleSubmit = async (ev: SubmitEventPromise) => {
  const res = await ev;
  if (!res.valid) return;
  loginErrMsg.value = undefined;
  isSubmitting.value = true;

  const password = form.value.password;
  const pwdEncoded = await derivePwd(form.value.name, password);

  const loginRes = await $client.user.login.mutate({
    name: form.value.name,
    password: pwdEncoded,
  });

  if (!loginRes) {
    isSubmitting.value = false;
    loginErrMsg.value = $L.tips.loginFail;
    return;
  }

  loginStore().userInfo = { ...loginRes.res, derivedPassword: pwdEncoded };
  isSubmitting.value = false;
  emit("success", form.value.syncAll);
};
</script>
