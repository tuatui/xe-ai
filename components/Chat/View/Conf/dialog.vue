<template>
  <VDialog
    v-model="isShow"
    class="max-w-[min(100%,476px)]"
    @update:model-value="isShow || cancelSetting()"
  >
    <VForm @submit.prevent>
      <VCard>
        <template v-slot:title>
          <VCardTitle class="!flex items-center justify-between">
            <h3>{{ $L.setting.topic.title }}</h3>
          </VCardTitle>
        </template>
        <VCardText>
          <p class="text-body-2 text-medium-emphasis mb4">
            {{ $L.setting.topic.tip }}
          </p>
          <VSelect
            variant="outlined"
            :items="bots"
            :no-data-text="$L.tips.botsEmp"
            v-model="selectedBot"
            @update:model-value="selectedModel = undefined"
            :item-props="(item) => ({ title: item.nickName })"
            return-object
            :label="$L.setting.botGroup"
          >
            <template v-slot:item="{ props, item }">
              <VListItem
                v-bind="props"
                class="overflow-hidden min-w0 text-wrap break-all"
              >
                <template v-slot:append>
                  <component :is="Services[item.value.provider]?.info?.icon" />
                </template>
              </VListItem>
            </template>
          </VSelect>
          <VSelect
            variant="outlined"
            :no-data-text="$L.tips.botModulesEmp"
            :items="modelList"
            v-model="selectedModel"
            :item-props="(i) => toModelListSelectItemProps(i)"
            :label="$L.common.model"
          />
        </VCardText>

        <VCardActions>
          <VSpacer></VSpacer>
          <VBtn
            size="large"
            variant="elevated"
            type="submit"
            color="primary"
            :text="$L.common.save"
            @click="
              confirmSetting({
                newBot: selectedBot,
                newModelName: selectedModel,
              }),
                (isShow = false)
            "
          />
        </VCardActions>
      </VCard>
    </VForm>
  </VDialog>
</template>
<script setup lang="ts">
const { isShow, selectedBot, selectedModel, confirmSetting, cancelSetting } =
  storeToRefs(topicConf());

const modelList = computed(() => selectedBot.value?.availableModel ?? []);
watch(selectedModel, (newVal) => {
  if (newVal) return;
  const defaultModel = selectedBot.value?.primaryModel;
  if (defaultModel) selectedModel.value = defaultModel;
});
const { Services } = chatServices();
const { bots } = storeToRefs(botsStore());
</script>
