<template>
  <VLayout>
    <VNavigationDrawer disable-resize-watcher permanent :width="width">
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
      <div ref="dragger" :style="style" class="nav-dragger"></div>
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
<script setup lang="ts">
import type ChatTabs from "~/components/ChatTabs.vue";
import { useDraggable } from "@vueuse/core";

const dragger = ref<HTMLElement | null>(null);
const width = ref(300);

const { x, style } = useDraggable(dragger, {
  initialValue: { x: 300, y: 0 },
  preventDefault: true,
  axis: "x",
  containerElement: document?.body,
});
watchDebounced(x, () => (width.value = x.value), {
  debounce: 50,
  maxWait: 50,
});
const userInput = ref("");
const { topics, updateTopic } = useTopics();
const updateTopicHandle = () => {
  updateTopic(userInput.value);
  userInput.value = "";
};
const tabsIns = ref<InstanceType<typeof ChatTabs>>();
</script>
<style lang="css" scoped>
.nav-dragger {
  height: 100dvh;
  width: 10px;
  user-select: none;
  cursor: col-resize;
  z-index: 999;
  transform: translateX(-5px);
  /* background-color: red; */
  position: fixed;
}
</style>
