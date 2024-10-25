<template>
  <div ref="contextDom" v-if="haveContext"></div>
  <VSkeletonLoader v-else type="article" class="h50" />
</template>
<script setup lang="ts">
const contextDom = ref<HTMLDivElement | null>();
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
    if (contextDom.value) contextDom.value.innerHTML = res;

    if (shouldScroll) emit("shouldScroll");

    isBusy = false;
  } while (shouldRerender);
};
watch(() => props.chat.context, handleToHtml);
onMounted(handleToHtml);
</script>
