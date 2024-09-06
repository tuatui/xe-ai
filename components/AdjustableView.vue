<template>
  <template v-if="viewTree.isLeaf">
    <component
      :is="viewTree.view"
      @splitHorizontal="$emit('splitHorizontal')"
      @splitVertical="$emit('splitVertical')"
      @close="$emit('close')"
    ></component>
  </template>
  <template v-else>
    <div
      class="flex w-full h-full"
      ref="viewParent"
      :style="{
        flexDirection: viewTree.isVertical ? 'column' : 'row',
      }"
    >
      <template v-for="(vt, i) in viewTree.children" :key="vt.uniqueKey">
        <AdjustableView
          v-model="viewTree.children[i]"
          class="min-w-0 min-h-0px cut-off"
          :class="{
            'cut-off-right':
              !viewTree.isVertical && i !== viewTree.children.length - 1,
            'cut-off-bottom':
              viewTree.isVertical && i !== viewTree.children.length - 1,
          }"
          :style="{
            width: viewTree.isVertical ? '100%' : `${vt.space * 100}%`,
            height: !viewTree.isVertical ? '100%' : `${vt.space * 100}%`,
          }"
          @splitHorizontal="handleSplit(true, i)"
          @splitVertical="handleSplit(false, i)"
          @close="handleViewClose(i)"
        />
        <div
          class="view-dragger-parent"
          v-if="i !== viewTree.children.length - 1"
        >
          <div
            class="view-dragger"
            :class="{
              'offset-x': !viewTree.isVertical,
              'offset-y': viewTree.isVertical,
            }"
            @mousedown="(ev) => handleMouseDrag(ev, i)"
          ></div>
        </div>
      </template>
    </div>
  </template>
</template>
<script setup lang="tsx">
import { ViewTree } from "#imports";
import { ChatTabs } from "#components";

const emit = defineEmits<{
  splitHorizontal: [];
  splitVertical: [];
  close: [];
}>();
const viewTree = defineModel<ViewTree>({ required: true });
const handleSplit = (isVertical: boolean, index: number) => {
  const target = viewTree.value.children[index];
  if (viewTree.value.children.length === 1) {
    viewTree.value.isVertical = isVertical;
    target.space = 0.5;
    viewTree.value.children.unshift(
      new ViewTree(true, (key) => <ChatTabs uniqueKey={key} />, false, [], 0.5)
    );
  } else {
    if (isVertical === viewTree.value.isVertical) {
      const newSpace = (target.space /= 2);
      viewTree.value.children.splice(
        index,
        0,
        new ViewTree(
          true,
          (key) => <ChatTabs uniqueKey={key} />,
          false,
          [],
          newSpace
        )
      );
    } else {
      viewTree.value.children[index] = new ViewTree(
        false,
        undefined,
        isVertical,
        [
          target,
          new ViewTree(
            true,
            (key) => <ChatTabs uniqueKey={key} />,
            false,
            [],
            0.5
          ),
        ],
        target.space
      );
      target.space = 0.5;
      target.isLeaf = true;
    }
  }
};
const store = chatTabsStore();
const handleViewClose = (index: number) => {
  const target = viewTree.value.children[index];
  if (viewTree.value.children.length === 1) {
    viewTree.value.children.pop();
    emit("close");
  } else if (viewTree.value.children.length === 2) {
    viewTree.value.children.splice(index, 1);
    viewTree.value.children[0].space = 1;
  } else {
    const oldView = viewTree.value.children[index];

    viewTree.value.children.splice(index, 1);
    if (index === 0) viewTree.value.children[0].space += oldView.space;
    else viewTree.value.children[index - 1].space += oldView.space;
  }
  store.globalSharedTabs.delete(target.uniqueKey);
};
const viewParent = ref<HTMLDivElement>();
const handleMouseDrag = (firstEv: MouseEvent, index: number) => {
  mouseDragImp(
    firstEv,
    {
      onDrag(ev) {
        const el = viewParent.value as HTMLElement;
        let outSideSpace, realSize;
        if (!viewTree.value.isVertical) {
          outSideSpace = el.getBoundingClientRect().x;
          realSize = el.clientWidth;
        } else {
          outSideSpace = el.getBoundingClientRect().y;
          realSize = el.clientHeight;
        }

        let preSpace = 0;
        for (let i = 0; i < index; i++)
          preSpace += viewTree.value.children[i].space * realSize;
        const pagePosition = viewTree.value.isVertical ? ev.pageY : ev.pageX;
        const targetPosition = pagePosition - outSideSpace - preSpace;

        const targetPercent = targetPosition / realSize;
        const targetView = viewTree.value.children[index];
        viewTree.value.children[index + 1].space +=
          targetView.space - targetPercent;
        targetView.space = targetPercent;
      },
    },
  );
};

</script>
<style lang="css" scoped>
* {
  --view-border-width: 0.2rem;
  --view-dragger-width: 1rem;
}
.cut-off {
  border-style: solid;
  border-width: 0;
  border-color: rgba(var(--v-border-color), var(--v-border-opacity));
  &.cut-off-right {
    border-right-width: var(--view-border-width);
  }
  &.cut-off-bottom {
    border-bottom-width: var(--view-border-width);
  }
}

.view-dragger-parent {
  position: relative;
  .view-dragger {
    width: 100%;
    height: 100%;
    min-width: var(--view-dragger-width);
    min-height: var(--view-dragger-width);
    user-select: none;
    position: absolute;
    z-index: 999;
    transition: background-color 200ms ease;
    &.offset-x {
      transform: translateX(
        calc(0px - ((var(--view-dragger-width) + var(--view-border-width)) / 2))
      );
      cursor: col-resize;
    }
    &.offset-y {
      transform: translateY(
        calc(0px - ((var(--view-dragger-width) + var(--view-border-width)) / 2))
      );
      cursor: row-resize;
    }
    &:hover {
      background-color: rgba(var(--v-border-color), var(--v-border-opacity));
    }
  }
}
</style>
