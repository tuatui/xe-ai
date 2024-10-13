<template>
  <VTextField :type="isShow ? 'text' : 'password'">
    <template v-slot:append-inner>
      <VBtn
        @click="isShow = !isShow"
        class="ml3"
        icon
        variant="text"
        :title="$t('tips.hidePwd')"
      >
        <VIcon :icon="isShow ? 'mdi-eye-off' : 'mdi-eye'" />
      </VBtn>
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
