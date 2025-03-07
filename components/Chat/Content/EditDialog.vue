<template>
  <VDialog
    class="max-w-[max(50dvw,700px)]"
    v-model:model-value="isOpen"
    @update:model-value="cancel"
  >
    <VForm @submit.prevent="confirm">
      <VCard>
        <VCardTitle class="!flex items-center justify-between">
          <h3>
            {{ form.id !== undefined ? $L.common.edit : $L.common.create }}
          </h3>
          <VBtn icon="i-mdi-close" variant="text" @click="cancel" />
        </VCardTitle>
        <VCardText>
          <VSelect
            v-model="form.from"
            :label="'角色'"
            :items="roles"
            :item-props="(i) => ({ title: ChatRole[i] })"
          />
          <VTextarea
            v-if="form.reasoningContent !== undefined"
            v-model="form.reasoningContent"
            :label="'推理内容'"
            variant="outlined"
          />
          <VTextarea
            v-model="form.context"
            :label="'内容'"
            variant="outlined"
            rows="12"
          />
          <VCheckbox
            :label="'停用Markdown语法'"
            v-model="form.noMarkdownRender"
          />
          <VTextarea
            v-for="i in form.toolCalls"
            v-model="i.arg"
            :label="`工具调用: ${i.name}`"
            variant="outlined"
          />
        </VCardText>
        <VDivider />
        <VCardActions>
          <VSpacer></VSpacer>
          <VBtn
            size="large"
            variant="elevated"
            type="submit"
            color="primary"
            :text="$L.common.save"
          />
        </VCardActions>
      </VCard>
    </VForm>
  </VDialog>
</template>
<script setup lang="ts">
const chatEdit = chatEditStore();
const roles = Object.values(ChatRole).filter(
  (item) => typeof item === "number",
);
const { cancel, confirm } = chatEdit;
const { isOpen, form } = storeToRefs(chatEdit);
</script>
