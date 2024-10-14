<template>
  <VDialog v-model="model" class="max-w-[max(40dvw,500px)]">
    <VForm @submit.prevent>
      <VCard>
        <template v-slot:title>
          <VCardTitle class="!flex items-center justify-between">
            <h3>
              {{ isUpdate ? $t("common.edit") : $t("common.create") }}
              {{ $t("common.model") }}
            </h3>
            <VBtn icon="i-mdi-close" variant="text" @click="model = false" />
          </VCardTitle>
        </template>
        <VCardText>
          <VSelect
            v-model="botsInfoClone.provider"
            :items="Services"
            :item-props="
              (item) => ({
                title: item.info.provider,
                value: item.info.key,
              })
            "
          />
          <VTextField
            v-model="botsInfoClone.apiUrl"
            :label="$t('setting.apiUrl')"
            placeholder="https://"
          />
          <VTextField
            v-model="botsInfoClone.nickName"
            :label="$t('common.name')"
          />
          <VTextField
            v-model="botsInfoClone.secretKey"
            type="password"
            :label="$t('model.secretKey')"
          />

          <div class="flex gap4">
            <VCombobox
              :hide-no-data="false"
              v-model:search="modelSearch"
              v-model="botsInfoClone.availableModel"
              :loading="isFetchingModelList"
              :items="modelList"
              :item-props="
                (item) => ({
                  title: item.name,
                  subtitle: item.owner,
                  value: item.name,
                })
              "
              clearable
              return-object
              chips
              multiple
              auto-select-first
            >
              <template v-slot:no-data>
                <VListItem>
                  <VListItemTitle v-if="modelSearch">
                    " <strong> {{ modelSearch }} </strong> "
                    {{ $t("setting.editModule.press") }}
                    <VKbd>ENTER</VKbd>
                    {{ $t("setting.editModule.toAdd") }}
                  </VListItemTitle>
                  <VListItemTitle v-else-if="modelList.length === 0">
                    {{ $t("setting.editModule.noData") }}
                  </VListItemTitle>
                </VListItem>
              </template>
            </VCombobox>
            <VBtn
              color="primary"
              prepend-icon="i-mdi-magnify"
              variant="text"
              size="x-large"
              @click="handleGetModelList"
              :disabled="isFetchingModelList"
            >
              {{ $t("setting.editModule.fetch") }}
            </VBtn>
          </div>
        </VCardText>

        <VCardActions>
          <VSpacer></VSpacer>
          <VBtn
            v-if="isUpdate"
            size="large"
            color="error"
            :text="$t('common.delete')"
            variant="text"
            @click="handleDelete(botsInfoClone.id!)"
          />
          <VBtn
            size="large"
            variant="elevated"
            type="submit"
            color="primary"
            :text="$t('common.submit')"
            @click="handleUpdate"
          />
        </VCardActions>
      </VCard>
    </VForm>
  </VDialog>
</template>
<script setup lang="ts">
const model = defineModel({ default: false });
const props = defineProps<{
  botInfo?: BotCreationData;
}>();
const emit = defineEmits<{
  newBotInfo: [BotCreationData];
  delete: [number];
}>();
const { Services } = chatServices();
const createBotsInfo = (): BotCreationData => ({
  nickName: "",
  secretKey: "",
  createTime: new Date(),
  name: "chat-gpt-3.5",
  availableModel: [],
  provider: Provider.OpenAI,
  apiUrl: props.botInfo?.provider
    ? Services[props.botInfo.provider].info.defaultBaseUrl
    : Services[Provider.OpenAI].info.defaultBaseUrl,
});
const handleUpdate = () => {
  emit("newBotInfo", botsInfoClone.value);
  model.value = false;
};
const handleDelete = (id: number) => {
  emit("delete", id);
  model.value = false;
};
const botsInfoClone = ref<BotCreationData>(props.botInfo ?? createBotsInfo());
const isUpdate = computed(() => botsInfoClone.value.id !== undefined);
watch(
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
);
const modelSearch = ref("");
const modelList = ref<ModelList[]>([]);
const isFetchingModelList = ref(false);
const handleGetModelList = async () => {
  if (isFetchingModelList.value) return;
  try {
    if (botsInfoClone.value.provider === undefined) return;
    const services = Services[botsInfoClone.value.provider];
    if (!services) return;
    const session = await services.createChatSession({
      apiKey: botsInfoClone.value.secretKey,
      baseURL: botsInfoClone.value.apiUrl,
    });

    if (!session.getModelList) return;

    isFetchingModelList.value = true;
    modelList.value = await session.getModelList();
  } catch (err) {
    console.warn(err);
  } finally {
    isFetchingModelList.value = false;
  }
};
watch(
  () => botsInfoClone.value.availableModel?.length,
  (newVal = 0, oldVal = 0) => {
    if (botsInfoClone.value.availableModel === undefined) return;

    const addTargetIndex = newVal - 1;
    if (newVal <= oldVal) return;

    if (typeof botsInfoClone.value.availableModel[addTargetIndex] !== "string")
      return;

    const str = botsInfoClone.value.availableModel[addTargetIndex];
    botsInfoClone.value.availableModel[addTargetIndex] = {
      name: str,
      owner: "user input",
    };
  },
);
</script>
