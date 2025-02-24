<template>
  <VDialog
    v-model="model"
    class="max-w-[max(40dvw,700px)]"
    @after-leave="$emit('leave')"
  >
    <VForm @submit.prevent="handleUpdate">
      <VCard>
        <template v-slot:title>
          <VCardTitle class="!flex items-center justify-between">
            <h3>
              {{ isUpdate ? $L.common.edit : $L.common.create }}
              {{ $L.common.model }}
            </h3>
            <VBtn icon="i-mdi-close" variant="text" @click="model = false" />
          </VCardTitle>
        </template>
        <VCardText class="overflow-auto">
          <VSelect
            :label="$L.model.provider"
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
            type="url"
            :rules="[(s) => (s ? true : $L.tips.mustExist)]"
            v-model="botsInfoClone.apiUrl"
            :label="$L.setting.apiUrl"
            placeholder="https://"
          />
          <VTextField
            v-model="botsInfoClone.nickName"
            autocomplete="name"
            :label="$L.common.name"
          />
          <XInputPwd
            v-model="botsInfoClone.secretKey"
            :rules="[(s) => (s ? true : $L.tips.mustExist)]"
            autocomplete="one-time-code"
            :label="$L.model.secretKey"
          />

          <div class="flex gap-col-4 flex-wrap mb6">
            <VCombobox
              :rules="[(s) => (s?.length ? true : $L.tips.mustExist)]"
              :label="$L.common.model"
              :hide-no-data="false"
              v-model:search="modelSearch"
              v-model="botsInfoClone.availableModel"
              :loading="isFetchingModelList"
              :items="modelList"
              :item-props="(i) => toModelListSelectItemProps(i)"
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
                    {{ $L.setting.editModule.press }}
                    <VKbd>ENTER</VKbd>
                    {{ $L.setting.editModule.toAdd }}
                  </VListItemTitle>
                  <VListItemTitle v-else-if="modelList.length === 0">
                    {{ $L.setting.editModule.noData }}
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
              {{ $L.setting.editModule.fetch }}
            </VBtn>
          </div>
          <VSelect
            v-model="botsInfoClone.primaryModel"
            :rules="[(s) => (s ? true : $L.tips.mustExist)]"
            :label="$L.setting.editModule.preferredModel"
            :no-data-text="$L.tips.primaryModelEmp"
            clearable
            :items="botsInfoClone.availableModel"
            :item-props="(i) => toModelListSelectItemProps(i)"
          />
          <VSelect
            :label="$L.setting.tools"
            v-model="botsInfoClone.tools"
            :items="Services[botsInfoClone.provider]?.tools ?? []"
            :item-props="(i) => ({ title: i.name })"
            :item-value="(i) => i.name"
            clearable
            multiple
          >
            <template
              #selection="{
                item: {
                  raw: { icon },
                  title,
                },
              }"
            >
              <VChip :prepend-icon="icon" label density="comfortable">
                {{ title }}
              </VChip>
            </template>
          </VSelect>
          <!-- 是否需要引入vuetify/labs的VNumberInput? -->
          <VTextField
            type="number"
            :label="$L.chat.memo"
            clearable
            :model-value="botsInfoClone.memoCount"
            suffix="条"
            @update:model-value="
              (str: string) => {
                const num = Number(str);
                if (!num || num < 0) botsInfoClone.memoCount = undefined;
                else botsInfoClone.memoCount = Math.min(num, 2 ** 31 - 1);
              }
            "
          />
          <VRadioGroup inline v-model="botsInfoClone.promptType">
            <VRadio
              :label="$L.setting.useDefault"
              :value="BotPrompt2Use.default"
            ></VRadio>
            <VRadio
              :label="$L.setting.noPrompt"
              :value="BotPrompt2Use.noPrompt"
            ></VRadio>
            <VRadio
              :label="$L.setting.custom"
              :value="BotPrompt2Use.custom"
            ></VRadio>
          </VRadioGroup>
          <template v-if="botsInfoClone.promptType === BotPrompt2Use.custom">
            <VTextarea
              :label="$L.chat.prompt"
              clearable
              v-model="botsInfoClone.prompt"
              hide-details
            />
          </template>
          <VCheckbox
            :label="$L.setting.showSysCtx"
            hide-details
            v-model="botsInfoClone.showPrompt"
          ></VCheckbox>
          <VCheckbox
            :label="$L.setting.useSysCtxEveryTime"
            hide-details
            v-model="botsInfoClone.addPromptEveryTime"
          ></VCheckbox>
        </VCardText>
        <VDivider />
        <VCardActions>
          <VSpacer></VSpacer>
          <VBtn
            v-if="isUpdate"
            size="large"
            color="error"
            :text="$L.common.delete"
            variant="text"
            @click="handleDelete(botsInfoClone.id!)"
          />
          <VBtn
            size="large"
            variant="elevated"
            type="submit"
            color="primary"
            :text="$L.common.submit"
          />
        </VCardActions>
      </VCard>
    </VForm>
  </VDialog>
</template>
<script setup lang="ts">
import type { SubmitEventPromise } from "vuetify";

const model = defineModel({ default: false });
const props = defineProps<{ botInfo?: BotCreationData }>();
const emit = defineEmits<{
  newBotInfo: [BotCreationData];
  delete: [number];
  leave: [];
}>();
const { Services } = chatServices();
const createBotsInfo = (): BotCreationData => ({
  nickName: "",
  secretKey: "",
  createTime: new Date(),
  name: "",
  availableModel: [],
  tools: Services[Provider.OpenAI].tools.map((each) => each.name),
  memoCount: undefined,
  primaryModel: undefined,
  prompt: chatMetaExamplePrompt,
  provider: Provider.OpenAI,
  apiUrl: props.botInfo?.provider
    ? Services[props.botInfo.provider].info.defaultBaseUrl
    : Services[Provider.OpenAI].info.defaultBaseUrl,
  promptType: BotPrompt2Use.default,
  addPromptEveryTime: false,
  showPrompt: false,
});
const botInfoDefault: Partial<BotCreationData> = {
  promptType: BotPrompt2Use.default,
  tools: [],
};
const handleUpdate = async (ev: SubmitEventPromise) => {
  const res = await ev;
  if (!res.valid) return;
  emit("newBotInfo", botsInfoClone.value);
  model.value = false;
};
const handleDelete = (id: number) => {
  emit("delete", id);
  model.value = false;
};
const botsInfoClone = ref<BotCreationData>(
  props.botInfo ? { ...botInfoDefault, ...props.botInfo } : createBotsInfo(),
);
const isUpdate = computed(() => botsInfoClone.value.id !== undefined);
watch([() => props.botInfo, model], ([newVal, isOpen]) => {
  if (!isOpen) return;
  if (!newVal) botsInfoClone.value = createBotsInfo();
  else botsInfoClone.value = structuredClone(toRaw(newVal));
});

watch(
  () => botsInfoClone.value.provider,
  (newVal) => {
    botsInfoClone.value.apiUrl = Services[newVal].info.defaultBaseUrl;
    botsInfoClone.value.tools = Services[newVal].tools.map((each) => each.name);
  },
);
const modelSearch = ref("");
const modelList = shallowRef<ModelList[]>([]);
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
    notificationStore().pushNotification({
      content: useNuxtApp().$L.tips.pwdOrAddrErr,
    });
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
