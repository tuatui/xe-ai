<template>
  <VAlert
    v-for="(item, index) in errList"
    :model-value="true"
    @update:model-value="(newVal) => errList.splice(index, 1)"
    class="mb-5"
    :key="index"
    :title="item.title"
    :text="item.text"
    type="error"
    closable
  ></VAlert>
</template>
<script setup lang="ts">
interface ErrTagContent {
  title: string;
  text: string;
}
const errList = ref<ErrTagContent[]>([]);
defineExpose({
  push: (title: string, text: string) => errList.value.push({ title, text }),
  clear: () => (errList.value = []),
});
</script>
