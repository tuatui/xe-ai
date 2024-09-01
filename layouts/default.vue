<template>
  <VLayout>
    <VNavigationDrawer disable-resize-watcher  permanent>
      <VTextField clearable hide-details v-model="userInput">
        <template #append-inner>
          <VBtn
            icon="mdi-send"
            variant="text"
            @click="updateTopicHandle"
          ></VBtn>
        </template>
      </VTextField>
      <SettingDialog />
      <VList density="compact" nav>
        <VListItem
          v-for="(item, i) in topics"
          @click="toTopic(item.id)"
          :key="i"
          :value="item"
          :title="item.title || '无标题'"
          color="primary"
        />
      </VList>
    </VNavigationDrawer>
    <VMain><slot></slot></VMain>
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
const toTopic = (id: number) => navigateTo({ path: `/topic/${id}` });
</script>
