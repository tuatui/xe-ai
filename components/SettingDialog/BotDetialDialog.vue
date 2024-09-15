<template>
  <VDialog v-model="model" class="max-w-[max(40dvw,500px)]">
    <VForm @submit.prevent>
      <VCard title="编辑">
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
          <VTextField v-model="botsInfoClone.nick_name" label="名字" />
          <VTextField
            v-model="botsInfoClone.secret_key"
            type="password"
            label="密钥"
          />

          <div class="flex gap4">
            <VCombobox
              :hide-no-data="false"
              v-model:search="modelSearch"
              v-model="botsInfoClone.avaiableModel"
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
                    "<strong>{{ modelSearch }}</strong
                    >" 按 回车<kbd>enter</kbd>可以添加
                  </VListItemTitle>
                  <VListItemTitle v-else-if="modelList.length === 0">
                    无数据，尝试获取数据或手动添加
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
              查找模型
            </VBtn>
          </div>
        </VCardText>

        <VCardActions>
          <VSpacer></VSpacer>
          <VBtn
            size="large"
            text="取消"
            variant="tonal"
            @click="model = false"
          />
          <VBtn
            size="large"
            type="submit"
            color="primary"
            text="提交"
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
  avaiableModel: [],
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
    const serivces = Services[botsInfoClone.value.provider];
    if (!serivces) return;
    const session = serivces.createChatSession({
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
  () => botsInfoClone.value.avaiableModel?.length,
  (newVal = 0, oldVal = 0) => {
    if (botsInfoClone.value.avaiableModel === undefined) return;

    const addTargetIndex = newVal - 1;
    if (newVal <= oldVal) return;

    if (typeof botsInfoClone.value.avaiableModel[addTargetIndex] !== "string")
      return;

    const str = botsInfoClone.value.avaiableModel[addTargetIndex];
    botsInfoClone.value.avaiableModel[addTargetIndex] = {
      name: str,
      owner: "user input",
    };
  }
);
</script>
