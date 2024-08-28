<template>
  <VLayout>
    <VNavigationDrawer>
      <VTextField clearable hide-details v-model="userInput">
        <template #append-inner>
          <VBtn
            icon="mdi-send"
            variant="text"
            @click="updateTopicHandle"
          ></VBtn>
        </template>
      </VTextField>
      <VList density="compact" nav>
        <VListItem
          v-for="(item, i) in topics"
          @click="currTopic = item.id"
          :key="i"
          :value="item"
          :title="item.title || '无标题'"
          color="primary"
        />
      </VList>
    </VNavigationDrawer>
    <VMain><ChatView :topic-i-d="currTopic" /></VMain>
  </VLayout>
</template>
<script setup lang="ts">
const userInput = ref("");
const currTopic = ref<number>();
const { topics, updateTopic } = useTopics();
const updateTopicHandle = () => {
  updateTopic(userInput.value);
  userInput.value = "";
};
</script>
