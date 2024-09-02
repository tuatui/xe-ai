<template>
  <VLayout>
    <VNavigationDrawer disable-resize-watcher permanent width="300">
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
          @click="tabsIns?.add(item)"
          :key="i"
          :value="item"
          :title="item.title || '无标题'"
          color="primary"
        />
      </VList>
    </VNavigationDrawer>
    <VMain><ChatTabs ref="tabsIns" /></VMain>
  </VLayout>
</template>
<script setup lang="tsx">
import type ChatTabs from "~/components/ChatTabs.vue";

const userInput = ref("");
const { topics, updateTopic } = useTopics();
const updateTopicHandle = () => {
  updateTopic(userInput.value);
  userInput.value = "";
};
const tabsIns = ref<InstanceType<typeof ChatTabs>>();
</script>
