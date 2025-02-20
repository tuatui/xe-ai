<template>
  <div>
    <ChatViewReasoningDetails
      v-if="chat.reasoningContent"
      v-model="isDetailsOpen"
    >
      <template #title>{{ $L.chat.reasoningDetail[detailsStatus] }}</template>
      <template #content>{{ chat.reasoningContent }}</template>
    </ChatViewReasoningDetails>
    <div ref="mdBodyEl" v-if="haveContext"></div>
    <VSkeletonLoader v-else type="article" class="h50" />
  </div>
</template>
<script setup lang="ts">
import { createCodeCopyBtn } from "~/utils/codeCopyBtn";
const enum ChatDetailStatus {
  reasoning = 0,
  viewDraft,
  hideDraft,
}
const mdBodyEl = ref<HTMLDivElement | null>();
const props = defineProps<{ chat: ChatData }>();

let isBusy = false;
let shouldRerender = false;

const detailsStatus = ref(ChatDetailStatus.viewDraft);
const isDetailsOpen = ref(false);
const haveContext = ref(false);
const { render } = chatRender();
const codeCopyBtnDB = useDebounceFn(createCodeCopyBtn, 60);
const handleToHtml = async () => {
  if (isBusy) {
    shouldRerender = true;
    return;
  }

  do {
    shouldRerender = false;
    isBusy = true;

    const res = props.chat.context
      ? await render(props.chat.id, props.chat.context)
      : "";

    if (!haveContext.value) {
      haveContext.value = true;
      await nextTick();
    }
    if (mdBodyEl.value) mdBodyEl.value.innerHTML = res;

    isBusy = false;
  } while (shouldRerender);
  if (mdBodyEl.value) codeCopyBtnDB(mdBodyEl.value);
};
const updateDetailOpenStatus = () =>
  (detailsStatus.value = isDetailsOpen.value
    ? ChatDetailStatus.hideDraft
    : ChatDetailStatus.viewDraft);

watch(() => props.chat.context, handleToHtml);
watch(
  () => props.chat.reasoningContent,
  () => (
    (detailsStatus.value = ChatDetailStatus.reasoning),
    nextTick(() => (isDetailsOpen.value = true))
  ),
  { once: true },
);

watch(() => props.chat.context, updateDetailOpenStatus, { once: true });
watch(isDetailsOpen, () => {
  if (!props.chat.context && props.chat.reasoningContent) return;
  updateDetailOpenStatus();
});
onMounted(handleToHtml);
</script>
