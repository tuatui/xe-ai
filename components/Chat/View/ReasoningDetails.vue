<template>
  <details
    ref="details"
    class="border rounded w-fit reasoning-details"
    @toggle="(ev) => (isOpen = ev.newState === 'open')"
  >
    <summary class="leading-9 pr4 pl2">
      <slot name="title"></slot>
    </summary>
    <article class="px4 whitespace-pre-wrap">
      <slot name="content"></slot>
    </article>
  </details>
</template>
<script setup lang="ts">
const details = ref<HTMLDetailsElement>();
const isOpen = defineModel({ default: false });
watch(isOpen, (newVal) => {
  if (!details.value) return;
  if (details.value.open === newVal) return;
  details.value.open = newVal;
});
</script>
<style lang="scss" scoped>
.reasoning-details {
  > summary {
    user-select: none;
    list-style-type: none;
    &::before {
      content: "";
      display: inline-block;
      width: 24px;
      height: 36px;
      margin-right: 4px;
      vertical-align: bottom;
      background-image: icon("i-mdi-chevron-right");
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      transition: 100ms;
    }
  }
  &[open] {
    > summary {
      &::before {
        transform: rotate(90deg);
      }
    }
  }
}
</style>
