<template>
  <VTextField :type="isShow ? 'text' : 'password'">
    <template v-slot:append-inner>
      <VIcon
        tabindex="-1"
        class="pl3"
        @click="isShow = !isShow"
        :icon="isShow ? 'mdi-eye-off' : 'mdi-eye'"
      />
    </template>
  </VTextField>
</template>
<script setup lang="ts">
import type { VTextField } from "vuetify/components";
type VTextFieldProps = /* @vue-ignore */ VTextField["$props"];

defineProps<VTextFieldProps>();
const isShow = ref(false);
</script>
<style lang="css" scoped></style>
