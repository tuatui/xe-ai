<template>
  <VBtn :aria-labelledby="`common-btn-${cID}`">
    <slot></slot>
    <VIcon v-if="useIcon !== undefined" :icon="useIcon" />
    <template v-if="useTooltip !== undefined">
      <div :id="`common-btn-${cID}`" v-if="embedTooltip">
        {{ useTooltip }}
      </div>
      <VTooltip
        v-else
        open-delay="200"
        activator="parent"
        :location="tooltipLocation ?? 'bottom'"
        :aria-labelledby="`common-btn-${cID}`"
      >
        <div :id="`common-btn-${cID}`">
          {{ useTooltip }}
        </div>
      </VTooltip>
    </template>
  </VBtn>
</template>
<script lang="ts" setup>
import type { VIcon, VTooltip } from "vuetify/components";
import type { VBtn, VMenu } from "vuetify/components";
type TextFieldSlots = InstanceType<typeof VTooltip>["location"];
type VBtnProps = VBtn["$props"];
const cID = useId();
interface Props extends /* @vue-ignore */ VBtnProps {
  useIcon?: VIcon["icon"];
  useTooltip?: string;
  embedTooltip?: boolean;
  tooltipLocation?: TextFieldSlots;
}
defineProps<Props>();
</script>
