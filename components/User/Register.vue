<template>
  <VForm @submit.prevent="handleSubmit">
    <VCard>
      <template v-slot:title>
        <VCardTitle class="!flex items-center justify-between">
          <h3>注册</h3>
        </VCardTitle>
      </template>
      <VCardText>
        <VTextField
          class="mb3"
          variant="outlined"
          autocomplete="username"
          :label="$t('common.account')"
          v-model="form.name"
          :rules="[handleCheckName]"
          validate-on="submit lazy"
          :loading="Boolean(isCheckingName)"
          ref="nameTextField"
          :disabled="isSubmitting"
        />
        <VTextField
          class="mb3"
          variant="outlined"
          type="password"
          autocomplete="new-password"
          :rules="[handlePasswordRule]"
          validate-on="invalid-input lazy"
          :label="$t('common.password')"
          v-model="form.password"
          :hint="passwordHint"
          :disabled="isSubmitting"
        />
        <VTextField
          class="mb1"
          variant="outlined"
          type="password"
          autocomplete="new-password"
          :rules="[handlePasswordRepeatRule]"
          validate-on="invalid-input lazy"
          label="重复密码"
          v-model="form.passwordRepeat"
          :disabled="isSubmitting"
        />
        <p class="text-body-2 text-medium-emphasis">
          注册后，会自动同步你的模型和密钥信息。密钥在上传前会被加密。
        </p>
        <UserSyncCheckBox v-model="form.syncAll" :disabled="isSubmitting" />
      </VCardText>
      <VDivider />
      <VCardActions>
        <I18nSwitch />
        <VSpacer></VSpacer>
        <VBtn
          :disabled="isSubmitting"
          size="large"
          color="primary"
          :text="'返回'"
          @click="$emit('change')"
        />
        <VBtn
          :loading="isSubmitting"
          size="large"
          type="submit"
          color="primary"
          :text="`注册`"
          variant="elevated"
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

const nameTextField = ref<InstanceType<typeof VTextField>>();

const $client = useNuxtApp().$client;
const createRegForm = () => ({
  name: "",
  password: "",
  passwordRepeat: "",
  syncAll: true,
});
const form = ref(createRegForm());

const isCheckingName = ref(false);
const handleCheckName = async () => {
  if (form.value.name === "") return "必填项";

  isCheckingName.value = true;
  const { isAvailable } = await $client.user.checkName.query({
    name: form.value.name,
  });
  isCheckingName.value = false;

  if (isAvailable) return true;
  else return "这个名字已经被使用了";
};
const handleTrigger = useDebounceFn(async () => {
  nameTextField.value?.validate();
}, 600);
watch(() => form.value.name, handleTrigger);

const handlePasswordRule = (pwd: string) => {
  if (pwd.length < 5) return "密码不应小于六位数";
  else if (pwd.length > 64) return "密码过长";
  return true;
};
const handlePasswordRepeatRule = () => {
  if (form.value.password === form.value.passwordRepeat) return true;
  return "前后输入的密码不一致";
};

const passwordStrong = ref(0);
const passwordHint = computed(() => {
  let a: string | undefined;
  if (passwordStrong.value <= 2) a = "低";
  else if (passwordStrong.value <= 4) a = "中";
  else a = "高";
  return "强度：" + a;
});
watch(
  () => form.value.password,
  (newPwd) => (passwordStrong.value = testPasswordStrong(newPwd)),
);
const isSubmitting = ref(false);
const handleSubmit = async (ev: SubmitEventPromise) => {
  ev.preventDefault();
  const res = await ev;
  if (!res.valid) return;
  isSubmitting.value = true;

  const pwd = form.value.password;
  const pwdEncoded = await derivePwd(form.value.name, pwd);

  const reg = await $client.user.register.mutate({
    name: form.value.name,
    password: pwdEncoded,
  });
  if (!reg) return;

  loginStore().userInfo = { ...reg, derivedPassword: pwdEncoded };
  isSubmitting.value = false;
  emit("success", form.value.syncAll);
  form.value = createRegForm();
};
</script>
