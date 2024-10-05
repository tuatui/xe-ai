<template>
  <VForm @submit.prevent="handleSubmit">
    <VCard>
      <template v-slot:title>
        <VCardTitle class="!flex items-center justify-between">
          <h3>注册</h3>
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
          :label="$t('common.account')"
          v-model="form.name"
          :rules="[handleCheckName]"
          validate-on="submit lazy"
          :loading="Boolean(isCheckingName)"
          ref="nameTextField"
          :disabled="isSubmitting"
        />
        <VTextField
          type="password"
          :rules="[handlePasswordRule]"
          validate-on="invalid-input lazy"
          :label="$t('common.password')"
          v-model="form.password"
          :hint="passwordHint"
          :disabled="isSubmitting"
        />
      </VCardText>
      <VDivider />
      <VCardActions>
        <VSpacer></VSpacer>
        <VBtn
          :disabled="isSubmitting"
          size="large"
          type="submit"
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
  close: [];
  lockWin: [];
  unLockWin: [];
}>();

const nameTextField = ref<InstanceType<typeof VTextField>>();

const $client = useNuxtApp().$client;
const createLoginForm = () => ({
  name: "",
  password: "",
});
const form = ref(createLoginForm());

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
  (newPwd) => (passwordStrong.value = testPasswordStrong(newPwd))
);

const isSubmitting = ref(false);
const handleSubmit = async (ev: SubmitEventPromise) => {
  const res = await ev;
  if (!res.valid) return;

  isSubmitting.value = true;
  emit("lockWin");

  const pwdEncoded = await pbkdf2Crypto(form.value.name, form.value.password);

  await $client.user.register.mutate({
    name: form.value.name,
    password: pwdEncoded,
  });

  emit("unLockWin");
  isSubmitting.value = false;
};
</script>
