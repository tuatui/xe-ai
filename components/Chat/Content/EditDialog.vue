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
            :label="$L.chat.role"
            :items="roles"
            :item-props="(i) => ({ title: ChatRole[i] })"
          />
          <VTextarea
            v-if="form.reasoningContent !== undefined"
            v-model="form.reasoningContent"
            :label="$L.chat.reasoningContent"
            variant="outlined"
          />
          <VTextarea
            v-model="form.context"
            :label="$L.chat.content"
            variant="outlined"
            rows="12"
          />
          <VTextarea
            v-for="i in form.toolCalls"
            v-model="i.arg"
            :label="$L.chat.toolCallWith(i.name)"
            variant="outlined"
          />
          <VDivider />
          <VCheckbox
            :label="$L.chat.noMarkdownRender"
            v-model="form.noMarkdownRender"
            hide-details
          />
          <VCheckbox :label="$L.common.disable" v-model="form.isDisabled" />
        </VCardText>
        <VDivider />
        <VCardActions>
          <VSpacer />
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
