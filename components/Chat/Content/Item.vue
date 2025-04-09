<template>
  <div>
    <ChatViewReasoningDetails
      v-if="chat.reasoningContent"
      v-model="isDetailsOpen"
      n
    >
      <template #title>{{ $L.chat.reasoningDetail[detailsStatus] }}</template>
      <template #content>{{ chat.reasoningContent }}</template>
    </ChatViewReasoningDetails>
    <div ref="mdBodyEl" v-if="haveContext"></div>
    <VSkeletonLoader v-else type="article" class="h50" />
    <template v-if="chat.toolCalls && chat.provider !== undefined">
      <component
        :is="
          services[chat.provider].tools.find(
            ({ name }) => name === toolCall.name,
          )?.component
        "
        :tool-call="toolCall"
        v-for="toolCall in chat.toolCalls"
      ></component>
    </template>
  </div>
</template>
<script setup lang="ts">
import { services } from "~/utils/AI/models/all";
import { createCodeCopyBtn } from "~/utils/codeCopyBtn";
import { DiffDOM } from "diff-dom";

const dd = new DiffDOM();

const enum ChatDetailStatus {
  reasoning = 0,
  viewDraft,
  hideDraft,
}
const mdBodyEl = ref<HTMLDivElement | null>();
const props = defineProps<{ chat: ChatData }>();

const isDetailsOpen = ref(false);
const haveContext = ref(false);
const { render } = chatRender();
const $L = useNuxtApp().$L;

const tasks = new CyclicTasks(async () => {
  const res = props.chat.noMarkdownRender
    ? props.chat.context
    : (
        await render(props.chat.id, {
          text: props.chat.context,
          shouldFullRender: props.chat.status !== ChatStatus.generating,
        })
      ).text;

  if (!haveContext.value) {
    haveContext.value = true;
    await nextTick();
  }
  if (mdBodyEl.value) {
    if (props.chat.noMarkdownRender) {
      const p = document.createElement("p");
      p.innerText = res;
      p.style.whiteSpace = "pre-wrap";
      mdBodyEl.value.innerHTML = "";
      mdBodyEl.value.appendChild(p);
    } else {
      const content = `<div>${res}</div>`;
      if (mdBodyEl.value.innerHTML) {
        const diff = dd.diff(mdBodyEl.value, content);
        dd.apply(mdBodyEl.value, diff);
      } else {
        mdBodyEl.value.innerHTML = content;
      }
    }

    createCodeCopyBtn(mdBodyEl.value, { title: $L.common.copy });
  }
});

const detailsStatus = ref(ChatDetailStatus.viewDraft);

const updateDetailOpenStatus = () =>
  (detailsStatus.value = isDetailsOpen.value
    ? ChatDetailStatus.hideDraft
    : ChatDetailStatus.viewDraft);

watch(
  [
    () => props.chat.context,
    () => props.chat.noMarkdownRender,
    () => props.chat.status,
  ],
  tasks.exec,
);
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
onMounted(tasks.exec);
</script>
