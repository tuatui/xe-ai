<template>
  <template v-if="viewTree.isLeaf">
    <component :is="viewTree.view" class="h-full w-full"></component>
  </template>
  <template v-else>
    <div
      class="flex w-full h-full"
      :style="{ flexDirection: viewTree.isVertical ? 'column' : 'row' }"
    >
      <AdjustableView
        v-for="vt in viewTree.children"
        :view-tree="vt"
        :style="{
          width: viewTree.isVertical ? '100%' : `${viewTree.space * 100}%`,
          height: !viewTree.isVertical ? '100%' : `${viewTree.space * 100}%`,
        }"
        class="min-w-0 min-h-0px"
      />
      </div>
    </template>
</template>
<script setup lang="ts">
interface ViewTree {
  isVertical: boolean;
  children: ViewTree[];
  space: number;

  isLeaf: boolean;
  view?: Component;
}
defineProps<{
  viewTree: ViewTree;
}>();
</script>
