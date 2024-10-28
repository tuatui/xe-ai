<template>
  <div ref="mdBodyEl" v-if="haveContext"></div>
  <VSkeletonLoader v-else type="article" class="h50" />
</template>
<script setup lang="ts">
import { createCodeCopyBtn } from "~/utils/codeCopyBtn";

const mdBodyEl = ref<HTMLDivElement | null>();
const props = defineProps<{
  chat: ChatData;
  isScrollToEnd?: boolean;
}>();
const emit = defineEmits<{
  shouldScroll: [];
}>();

let isBusy = false;
let shouldRerender = false;

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

    const shouldScroll = props.isScrollToEnd;

    const res = props.chat.context
      ? await render(props.chat.id, props.chat.context)
      : "";

    if (!haveContext.value) {
      haveContext.value = true;
      await nextTick();
    }
    if (mdBodyEl.value) mdBodyEl.value.innerHTML = res;

    if (shouldScroll) emit("shouldScroll");

    isBusy = false;
  } while (shouldRerender);
  if (mdBodyEl.value) codeCopyBtnDB(mdBodyEl.value);
};
watch(() => props.chat.context, handleToHtml);
onMounted(handleToHtml);
</script>
