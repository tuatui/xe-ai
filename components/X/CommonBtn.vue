<template>
  <VBtn :aria-labelledby="`common-btn-${cID}`">
    <VIcon v-if="useIcon !== undefined" :icon="useIcon" />
    <slot></slot>
    <VTooltip
      open-delay="200"
      v-if="useTooltip !== undefined"
      activator="parent"
      :location="tooltipLocation ?? 'bottom'"
      :aria-labelledby="`common-btn-${cID}`"
    >
      <div :id="`common-btn-${cID}`">
        {{ useTooltip }}
      </div>
    </VTooltip>
  </VBtn>
</template>
<script lang="ts" setup>
import type { VTooltip } from "vuetify/components";
import type { VBtn } from "vuetify/components";
type TextFieldSlots = InstanceType<typeof VTooltip>["location"];
type VBtnProps = VBtn["$props"];
const cID = useId();
interface Props extends /* @vue-ignore */ VBtnProps {
  useIcon?: string;
  useTooltip?: string;
  tooltipLocation?: TextFieldSlots;
}
defineProps<Props>();
</script>
