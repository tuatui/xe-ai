<template>
  <VForm @submit.prevent="handleSubmit">
    <VCard>
      <template v-slot:title>
        <VCardTitle class="!flex items-center justify-between">
          <h3>
            {{ isUpdate ? $L.common.edit : $L.common.create }}
            {{ $L.common.layouts }}
          </h3>
          <VBtn icon="i-mdi-close" variant="text" @click="emit('close')" />
        </VCardTitle>
      </template>
      <VCardText>
        <VTextField
          v-model="form.name"
          :label="$L.common.name"
          :rules="[(s) => (s ? true : $L.tips.mustExist)]"
        />
      </VCardText>

      <VCardActions>
        <VSpacer></VSpacer>
        <template v-if="isUpdate">
          <VBtn
            size="large"
            color="error"
            :text="$L.common.delete"
            variant="text"
            @click="handleDelete(form.id!)"
          />
          <VBtn
            size="large"
            variant="elevated"
            color="primary"
            @click="handleUse"
            :text="$L.common.use"
          />
        </template>
        <template v-else>
          <VBtn
            size="large"
            variant="elevated"
            type="submit"
            color="primary"
            :text="$L.common.submit"
          />
        </template>
      </VCardActions>
    </VCard>
  </VForm>
</template>
<script setup lang="ts">
import type { SubmitEventPromise } from "vuetify";
import { chatTreeStore } from "~/stores/chatTree";

const props = defineProps<{
  info?: UpdateVTLayoutData;
}>();
const emit = defineEmits<{
  new: [UpdateVTLayoutData];
  delete: [number];
  close: [];
}>();
const ct = chatTreeStore();
const { toOrdinary, buildFromOrdinary } = ct;
const createBotsInfo = (): UpdateVTLayoutData => ({
  name: "",
  vt: toOrdinary(),
});

const handleDelete = (id: number) => {
  emit("delete", id);
  emit("close");
};
const handleUse = () => {
  if (defaultSettingSync().mobile.isMobileScreen)
    notificationStore().pushNotification({
      content: "无法在此屏幕上应用布局",
    });
  else ct.tree = buildFromOrdinary(form.value.vt);

  emit("close");
};
const form = ref<UpdateVTLayoutData>(props.info ?? createBotsInfo());
const isUpdate = computed(() => form.value.id !== undefined);
const handleSubmit = async (ev: SubmitEventPromise) => {
  const res = await ev;
  if (!res.valid) return;

  emit("new", form.value);
  emit("close");
};
/* watch(
  () => props.botInfo,
  (newVal) => {
    if (!newVal) botsInfoClone.value = createBotsInfo();
    else botsInfoClone.value = structuredClone(toRaw(newVal));
  },
);
watch(
  () => botsInfoClone.value.provider,
  (newVal) => {
    if (!newVal) return;
    botsInfoClone.value.apiUrl = Services[newVal].info.defaultBaseUrl;
  },
); */
</script>
