<template>
  <div
    ref="dragger"
    class="dragger offset-x top-0px fixed h-100dvh cursor-col-resize"
    :class="{ active: isDragging }"
    :style="{ left: `${position.x}px` }"
  ></div>
</template>
<script setup lang="ts">
const dragger = ref<HTMLElement | null>(null);
const width = defineModel<number>({ required: true });
const { isDragging, position } = useMouseDrag(
  dragger,
  {
    init: { x: width.value, y: 0 },
  },
  {
    onTryDrag: (pos) => {
      const max = window.innerWidth / 3;
      const min = Math.min(max / 3, 100);
      if (pos.x > max) return { x: max };
      else if (pos.x > min) return pos;
      else return { x: min };
    },
  }
);

watchDebounced(
  () => position.value.x,
  () => (width.value = position.value.x),
  {
    debounce: 50,
    maxWait: 50,
  }
);
</script>
