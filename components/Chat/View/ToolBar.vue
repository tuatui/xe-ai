<template>
  <template v-if="toolsEnable.length <= 4">
    <VSheet class="h9 min-w9 box-border p1" rounded>
      <template v-for="tool in toolsEnable">
        <XCommonBtn
          :class="{ 'filter-grayscale-100': !tNamesSet.has(tool.name) }"
          @click="handleUpdate(tool)"
          icon
          :use-icon="tool.icon"
          :use-tooltip="`${tool.name}: ${tNamesSet.has(tool.name) ? '启用' : '禁用'}`"
          variant="text"
          rounded
          density="comfortable"
          size="small"
          tooltip-location="top right"
        ></XCommonBtn>
      </template>
    </VSheet>
  </template>
  <template v-else>
    <VMenu location="top right" :close-on-content-click="false">
      <template #activator="{ props }">
        <VBtn
          icon="i-mdi-apps"
          variant="text"
          rounded
          v-bind="props"
          density="comfortable"
        ></VBtn>
      </template>
      <template #default="{ isActive }">
        <VSheet max-width="400" class="mb4" v-if="isActive">
          <div
            class="grid gap2 p2"
            :style="{
              gridTemplateColumns: `repeat(${Math.floor(Math.sqrt(toolsEnable.length))}, 1fr)`,
            }"
          >
            <VBtn
              v-for="tool in toolsEnable"
              :is="tool.icon"
              :class="{ 'filter-grayscale-100': !tNamesSet.has(tool.name) }"
              @click="handleUpdate(tool)"
              :icon="tool.icon"
              variant="text"
              rounded
              density="comfortable"
              size="small"
            ></VBtn>
          </div>
        </VSheet>
      </template>
    </VMenu>
  </template>
</template>
<script setup lang="ts">
const { server, botToolNames = [] } = defineProps<{
  server: ChatService;
  botToolNames?: string[];
}>();
// 用set实现？
const toolsEnable = computed(() =>
  server.tools.filter(({ name }) => botToolNames.includes(name)),
);
const toolNames = defineModel<string[]>({ default: [] });
const tNamesSet = computed(() => new Set(toolNames.value));
const handleUpdate = (tool: ChatTool) => {
  if (tNamesSet.value.has(tool.name)) tNamesSet.value.delete(tool.name);
  else tNamesSet.value.add(tool.name);
  toolNames.value = [...tNamesSet.value];
};
watch(
  () => botToolNames,
  () => console.log(1),
  { deep: true },
);
</script>
