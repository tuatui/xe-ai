<template>
  <VDialog v-model="model" class="max-w-[max(40dvw,500px)]">
    <VForm @submit.prevent>
      <VCard :title="$t('common.edit')">
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
            v-model="botsInfoClone.nick_name"
            :label="$t('common.name')"
          />
          <VTextField
            v-model="botsInfoClone.secret_key"
            type="password"
            :label="$t('module.secretKey')"
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
              prepend-icon="mdi-magnify"
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
            size="large"
            :text="$t('common.cancel')"
            variant="tonal"
            @click="model = false"
          />
          <VBtn
            size="large"
            type="submit"
            color="primary"
            :text="$t('common.submit')"
            variant="flat"
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
  botInfo?: Partial<BotsData>;
}>();
const emit = defineEmits<{
  newBotInfo: [Partial<BotsData>];
}>();
const createBotsInfo = (): Partial<BotsData> => ({
  nick_name: "",
  secret_key: "",
  name: "chat-gpt-3.5",
  availableModel: [],
  provider: Provider.OpenAI,
});
const handleUpdate = () => {
  emit("newBotInfo", botsInfoClone.value);
  model.value = false;
};
const botsInfoClone = ref<Partial<BotsData>>(props.botInfo ?? createBotsInfo());
watch(
  () => props.botInfo,
  (newVal) => {
    if (!newVal) botsInfoClone.value = createBotsInfo();
    else botsInfoClone.value = structuredClone(toRaw(newVal));
  }
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
    const session = services.createChatSession({
      apiKey: botsInfoClone.value.secret_key,
      baseURL: "https://apic.ohmygpt.com/v1",
    });

    if (!session.getModelList) return;

    isFetchingModelList.value = true;
    modelList.value = await session.getModelList();
  } catch (err) {
    console.log(err);
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
  }
);
</script>
