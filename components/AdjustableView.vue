<template>
  <template v-if="viewTree.isLeaf">
    <component
      :is="viewTree.view"
      @splitHorizontal="handleSplit(true)"
      @splitVertical="handleSplit(false)"
      @close="$emit('viewClose')"
    ></component>
  </template>
  <template v-else>
    <div
      class="flex w-full h-full"
      :style="{
        flexDirection: viewTree.isVertical ? 'column' : 'row',
      }"
    >
      <AdjustableView
        v-for="(vt, i) in viewTree.children"
        :key="vt.uniqueKey"
        v-model="viewTree.children[i]"
        class="min-w-0 min-h-0px"
        :style="{
          width: viewTree.isVertical ? '100%' : `${vt.space * 100}%`,
          height: !viewTree.isVertical ? '100%' : `${vt.space * 100}%`,
        }"
        @viewClose="handleViewClose(i)"
      />
    </div>
  </template>
</template>
<script setup lang="tsx">
import { ViewTree } from "#imports";
import { ChatTabs } from "#components";
import { KeepAlive } from "vue";

defineEmits<{ viewClose: [] }>();
const viewTree = defineModel<ViewTree>({ required: true });
const handleSplit = (isVertical: boolean) => {
  const currVT = viewTree.value;
  viewTree.value = new ViewTree(
    false,
    undefined,
    isVertical,
    [
      currVT,
      new ViewTree(true, (key) => <ChatTabs uniqueKey={key} />, false, [], 0.5),
    ],
    currVT.space
  );
  currVT.space = 0.5;
  currVT.isLeaf = true;
};
const store = chatTabsStore();
const handleViewClose = (index: number) => {
  if (viewTree.value.children.length === 2) {
    const oldView = viewTree.value;

    store.globalSharedTabs.delete(viewTree.value.children[index].uniqueKey);

    viewTree.value.children.splice(index, 1);

    viewTree.value = viewTree.value.children.shift()!;
    viewTree.value.space = oldView.space;
  }
  /* else if (viewTree.value.children.length > 2) {
    viewTree.value.children
  } */
};
</script>
