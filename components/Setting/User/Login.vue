<template>
  <VForm @submit.prevent="handleSubmit">
    <VCard>
      <template v-slot:title>
        <VCardTitle class="!flex items-center justify-between">
          <h3>登录</h3>
          <VBtn
            icon="mdi-close"
            variant="text"
            @click="$emit('close')"
            :disabled="isSubmitting"
          />
        </VCardTitle>
      </template>
      <VCardText>
        <VTextField
          autocomplete="username"
          :label="$t('common.account')"
          v-model="form.name"
          :disabled="isSubmitting"
        />
        <XInputPwd
          :label="$t('common.password')"
          v-model="form.password"
          :disabled="isSubmitting"
        />
        <p class="text-body-2 text-medium-emphasis">
          登录后，会自动同步你的模型和密钥信息。密钥在上传前会被加密。
        </p>
        <SettingUserSyncCheckBox
          v-model="form.syncAll"
          :disabled="isSubmitting"
        />
      </VCardText>
      <VDivider />
      <VCardActions>
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
  close: [];
  lockWin: [];
  unLockWin: [];
}>();
const $client = useNuxtApp().$client;
const createLoginForm = () => ({
  name: "",
  password: "",
  syncAll: true,
});
const form = ref(createLoginForm());

const isSubmitting = ref(false);
const { diffServerAndLocalBot } = useBots();
const { pushNotification } = notificationStore();

const handleSubmit = async (ev: SubmitEventPromise) => {
  const res = await ev;
  if (!res.valid) return;

  isSubmitting.value = true;
  emit("lockWin");

  const password = form.value.password;
  const pwdEncoded = await derivePwd(form.value.name, password);

  const loginRes = await $client.user.login.mutate({
    name: form.value.name,
    password: pwdEncoded,
  });
  emit("unLockWin");
  isSubmitting.value = false;
  if (!loginRes) {
    pushNotification({
      content: "账号或密码错误",
      timeout: 3000,
      allowClose: false,
    });
    return;
  }

  //TODO 原始密码改为派生密码
  await diffServerAndLocalBot(pwdEncoded);

  loginStore().userInfo = { ...loginRes.res, derivedPassword: pwdEncoded };

  emit("close");
  if (form.value.syncAll) setTimeout(() => topicStore().syncTopic(), 1000);
};
</script>
