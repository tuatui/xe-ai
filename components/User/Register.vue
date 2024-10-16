<template>
  <VForm @submit.prevent="handleSubmit">
    <VCard>
      <template v-slot:title>
        <VCardTitle class="!flex items-center justify-between">
          <h3>{{ $L.common.register }}</h3>
        </VCardTitle>
      </template>
      <VCardText>
        <VTextField
          class="mb3"
          variant="outlined"
          autocomplete="username"
          :label="$L.common.account"
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
          :label="$L.common.password"
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
          :label="$L.common.repeatPwd"
          v-model="form.passwordRepeat"
          :disabled="isSubmitting"
        />
        <p class="text-body-2 text-medium-emphasis">
          {{ $L.tips.regAndSync }}
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
          :text="$L.common.login"
          @click="$emit('change')"
        />
        <VBtn
          :loading="isSubmitting"
          size="large"
          type="submit"
          color="primary"
          :text="$L.common.register"
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

const { $client, $L } = useNuxtApp();

const createRegForm = () => ({
  name: "",
  password: "",
  passwordRepeat: "",
  syncAll: true,
});
const form = ref(createRegForm());

const isCheckingName = ref(false);
const handleCheckName = async () => {
  if (form.value.name === "") return $L.tips.mustExist;

  isCheckingName.value = true;
  const { isAvailable } = await $client.user.checkName.query({
    name: form.value.name,
  });
  isCheckingName.value = false;

  if (isAvailable) return true;
  else return $L.tips.nameAlreadyUse;
};
const handleTrigger = useDebounceFn(async () => {
  nameTextField.value?.validate();
}, 600);
watch(() => form.value.name, handleTrigger);

const handlePasswordRule = (pwd: string) => {
  if (pwd.length < 5) return $L.tips.pwdTooShort;
  else if (pwd.length > 64) return $L.tips.pwdTooLooong;
  return true;
};
const handlePasswordRepeatRule = () => {
  if (form.value.password === form.value.passwordRepeat) return true;
  return $L.tips.pwdIsDiff;
};

const passwordStrong = ref(0);
const passwordHint = computed(() => {
  let a: string | undefined;
  if (passwordStrong.value <= 2) a = $L.common.low;
  else if (passwordStrong.value <= 4) a = $L.common.middle;
  else a = $L.common.hight;
  return $L.common.strength + a;
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
