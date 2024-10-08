<template>
  <VForm @submit.prevent="handleSubmit">
    <VCard>
      <template v-slot:title>
        <VCardTitle class="!flex items-center justify-between">
          <h3>登录</h3>
        </VCardTitle>
      </template>
      <VCardText>
        <VTextField
          class="mb3"
          variant="outlined"
          autocomplete="username"
          :label="$t('common.account')"
          v-model="form.name"
          :disabled="isSubmitting"
        />
        <XInputPwd
          variant="outlined"
          :label="$t('common.password')"
          v-model="form.password"
          :disabled="isSubmitting"
        />
        <p class="text-body-2 text-medium-emphasis">
          登录后，会自动同步你的模型和密钥信息。密钥在上传前会被加密。
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
          :text="'注册'"
          @click="$emit('change')"
          :disabled="isSubmitting"
        />
        <VBtn
          size="large"
          type="submit"
          color="primary"
          :text="$t('common.login')"
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
const form = ref(createLoginForm());

const isSubmitting = ref(false);
const { pushNotification } = notificationStore();

const handleSubmit = async (ev: SubmitEventPromise) => {
  const res = await ev;
  if (!res.valid) return;

  isSubmitting.value = true;

  const password = form.value.password;
  const pwdEncoded = await derivePwd(form.value.name, password);

  const loginRes = await $client.user.login.mutate({
    name: form.value.name,
    password: pwdEncoded,
  });

  if (!loginRes) {
    pushNotification({
      content: "账号或密码错误",
      timeout: 3000,
      allowClose: false,
    });
    return;
  }
  loginStore().userInfo = { ...loginRes.res, derivedPassword: pwdEncoded };
  isSubmitting.value = false;
  emit("success", form.value.syncAll);
  form.value = createLoginForm();
};
</script>
