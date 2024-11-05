<template>
  <template v-if="viewTree.isLeaf">
    <component :is="viewTree.view" :split-leaf :cut-leaf></component>
  </template>
  <template v-else>
    <div
      class="flex w-full h-full rtl:flex-row-reverse"
      ref="viewParent"
      :class="{ '!flex-col': viewTree.isVertical }"
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
          :split-leaf="(b, lc, s) => handleSplit(b, i, lc, s)"
          :cut-leaf="() => handleViewClose(i)"
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
            @mousedown.stop="(ev) => handleMouseDrag(ev, i)"
          ></div>
        </div>
      </template>
    </div>
  </template>
</template>
<script setup lang="tsx">
import { ViewTree } from "#imports";
import type {
  LeafComponent,
  SplitLeafFn,
  LeafComponentUniqueKey,
  CutLeafFn,
} from "~/types/adjustableView";

const props = defineProps<{ splitLeaf?: SplitLeafFn; cutLeaf?: CutLeafFn }>();

const viewTree = defineModel<ViewTree>({ required: true });
/**
 * 切分窗口
 * @todo 允许向左切分
 */
const handleSplit = (
  isVertical: boolean,
  index: number,
  NewTab: LeafComponent,
  onLeftSide = false,
): LeafComponentUniqueKey => {
  const target = viewTree.value.children[index];
  let uniqueKey: symbol = Symbol("void");
  if (viewTree.value.children.length === 1) {
    viewTree.value.isVertical = isVertical;
    target.space = 0.5;
    const child = new ViewTree(
      true,
      (key) => {
        uniqueKey = key;
        return <NewTab uniqueKey={key} />;
      },
      false,
      [],
      0.5,
    );
    if (onLeftSide) viewTree.value.children.unshift(child);
    else viewTree.value.children.push(child);
  } else {
    if (isVertical === viewTree.value.isVertical) {
      const newSpace = (target.space /= 2);
      const at = onLeftSide ? index : index + 1;
      viewTree.value.children.splice(
        at,
        0,
        new ViewTree(
          true,
          (key) => {
            uniqueKey = key;
            return <NewTab uniqueKey={key} />;
          },
          false,
          [],
          newSpace,
        ),
      );
    } else {
      const children = [
        target,
        new ViewTree(
          true,
          (key) => {
            uniqueKey = key;
            return <NewTab uniqueKey={key} />;
          },
          false,
          [],
          0.5,
        ),
      ];
      if (onLeftSide) children.reverse();
      viewTree.value.children[index] = new ViewTree(
        false,
        undefined,
        isVertical,
        children,
        target.space,
      );
      target.space = 0.5;
      target.isLeaf = true;
    }
  }
  return uniqueKey;
};

const handleViewClose = (index: number) => {
  const target = viewTree.value.children[index];
  if (viewTree.value.children.length === 1) {
    viewTree.value.children.pop();
    if (props.cutLeaf) props.cutLeaf();
  } else if (viewTree.value.children.length === 2) {
    viewTree.value.children.splice(index, 1);
    viewTree.value.children[0].space = 1;
  } else {
    const oldView = viewTree.value.children[index];

    viewTree.value.children.splice(index, 1);
    if (index === 0) viewTree.value.children[0].space += oldView.space;
    else viewTree.value.children[index - 1].space += oldView.space;
  }
  return target.uniqueKey;
};

const viewParent = ref<HTMLDivElement>();
const handleMouseDrag = (firstEv: MouseEvent, index: number) => {
  const target = firstEv.target as HTMLDivElement;
  target.classList.add("active");
  mouseDragImp(firstEv, {
    onDrag: (ev) => {
      const el = viewParent.value as HTMLElement;
      let outSideSpace, elSize, mousePosition;
      if (!viewTree.value.isVertical) {
        outSideSpace = el.getBoundingClientRect().x;
        elSize = el.clientWidth;
        mousePosition = ev.pageX;
      } else {
        outSideSpace = el.getBoundingClientRect().y;
        elSize = el.clientHeight;
        mousePosition = ev.pageY;
      }

      let preSpace = 0;
      for (let i = 0; i <= index; i++)
        preSpace += viewTree.value.children[i].space * elSize;

      let targetPosition = mousePosition - outSideSpace;

      const currPosition = preSpace;
      const expectPX = targetPosition - currPosition;

      if (expectPX > 0) {
        const taskList: ResizeFn[] = [];
        let leftPX = expectPX;
        for (let i = index + 1; i < viewTree.value.children.length; i++) {
          const res = resizeNegotiate(
            viewTree.value.children[i],
            leftPX,
            viewTree.value.isVertical,
            viewTree.value.children[i].space * elSize,
          );
          if (!res) continue;
          leftPX -= res.consumePX;
          taskList.push(res.startResize);
          if (leftPX <= 0) break;
        }
        if (leftPX > 1) target.classList.add("reject");
        else target.classList.remove("reject");

        if (taskList.length === 0) return;

        taskList.forEach((each) => each());
        const targetPercent = (expectPX - leftPX) / elSize;

        viewTree.value.children[index].space += targetPercent;
      } else {
        const taskList: ResizeFn[] = [];
        let leftPX = -expectPX;
        for (let i = index; i >= 0; i--) {
          const res = resizeNegotiate(
            viewTree.value.children[i],
            leftPX,
            viewTree.value.isVertical,
            viewTree.value.children[i].space * elSize,
          );
          if (!res) continue;
          leftPX -= res.consumePX;
          taskList.push(res.startResize);
          if (leftPX <= 0) break;
        }
        if (leftPX > 1) target.classList.add("reject");
        else target.classList.remove("reject");

        if (taskList.length === 0) return;

        taskList.forEach((each) => each());
        const targetPercent = (-expectPX - leftPX) / elSize;
        viewTree.value.children[index + 1].space += targetPercent;
      }
    },
    onStop: () => {
      target.classList.remove("reject");
      target.classList.remove("active");
    },
  });
};

type ResizeFn = (size?: number) => void;
const resizeNegotiate = (
  vt: ViewTree,
  expectPX: number,
  isVertical: boolean,
  spacePX: number,
): {
  startResize: ResizeFn;
  consumePX: number;
} | void => {
  const minPX = 200;
  if (vt.isLeaf) {
    if (spacePX <= minPX) return;
    const leftPX = spacePX - minPX;
    const consumePX = Math.min(leftPX, expectPX);
    return {
      startResize: (size: number = consumePX) => {
        vt.space = ((spacePX - size) * vt.space) / spacePX;
      },
      consumePX,
    };
  }
  if (vt.isVertical === isVertical) {
    let leftPX = expectPX;
    const resizeJob: ResizeFn[] = [];
    for (const vtc of vt.children) {
      const res = resizeNegotiate(
        vtc,
        expectPX,
        isVertical,
        spacePX * vtc.space,
      );
      if (!res || !res.consumePX) continue;
      leftPX -= res.consumePX;
      resizeJob.push(res.startResize);
      if (leftPX <= 0) break;
    }
    const consumePX = expectPX - leftPX;
    return {
      startResize: () => {
        resizeJob.forEach((each) => each());
        const shirkPresent = 1 - vt.children.reduce((p, c) => p + c.space, 0);
        const eventPresent = shirkPresent / vt.children.length;
        vt.children.forEach((each) => (each.space += eventPresent));
      },
      consumePX,
    };
  } else {
    const minSizes: number[] = [];
    const taskList: ResizeFn[] = [];
    for (const vtc of vt.children) {
      if (vtc.isLeaf) continue;
      const res = resizeNegotiate(vtc, expectPX, isVertical, spacePX);
      if (!res || !res.consumePX) return;
      minSizes.push(res.consumePX);
      taskList.push(res.startResize);
    }
    const minConsumePX = Math.min(...minSizes, spacePX - minPX, expectPX);
    return {
      startResize: (size: number = minConsumePX) => {
        taskList.forEach((each) => each(size));
        vt.space = ((spacePX - size) * vt.space) / spacePX;
      },
      consumePX: minConsumePX,
    };
  }
};
</script>
<style lang="scss" scoped>
@use "/assets/tab.scss" as *;
.cut-off {
  border-style: solid;
  border-width: 0;
  border-color: rgba(var(--v-border-color), var(--v-border-opacity));
  &.cut-off-right {
    border-right-width: $view-border-width;
  }
  &.cut-off-bottom {
    border-bottom-width: $view-border-width;
  }
}
.view-dragger-parent {
  direction: ltr;
  position: relative;
  .view-dragger {
    width: 100%;
    height: 100%;
    position: absolute;

    @include dragger-base;
  }
}
</style>
