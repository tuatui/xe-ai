<template>
  <div v-html="html" v-if="html || !chat.context"></div>
  <VSkeletonLoader v-else type="article" class="h50" />
</template>
<script setup lang="ts">
const props = defineProps<{
  chat: ChatData;
  isScrollToEnd?: boolean;
}>();
const emit = defineEmits<{
  shouldScroll: [];
}>();

const html = ref("");
const render = async () => {
  if (!props.chat.context) return;
  const shouldScroll = props.isScrollToEnd;

  html.value = await htmlRender(props.chat.context);

  if (!shouldScroll) return;
  await nextTick();
  emit("shouldScroll");
};
watch(() => props.chat.context, render);
onMounted(render);
</script>
