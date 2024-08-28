<template>
  <ChatView :topic-i-d="topicID" />
</template>
<script setup lang="ts">
const route = useRoute();
const topicID = computed(() => {
  const routerID = Number(route.params.id);
  if (!isNaN(routerID)) return routerID;
});
</script>
