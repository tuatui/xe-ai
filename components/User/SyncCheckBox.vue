<template>
  <VCheckbox
    label="同步当前的临时聊天记录"
    color="primary"
    v-model="isChecked"
    :disabled="disabled"
    hide-details
  />
  <VExpandTransition>
    <p class="text-body-2 text-medium-emphasis" v-show="!isChecked">
      当前的临时聊天记录将不会被上传，但仍保存在你的浏览器中。只需注销登录即可查看。
    </p>
  </VExpandTransition>
</template>
<script setup lang="ts">
const isChecked = defineModel<boolean>();
defineProps<{ disabled?: boolean }>();
</script>
