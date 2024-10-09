<template>
  <XCommonBtn
    icon
    variant="text"
    @click.stop="$emit('handleNewChat')"
    use-icon="mdi-plus"
    :use-tooltip="$t('chat.new')"
  />
  <XCommonBtn
    icon
    variant="text"
    @click.stop="$emit('splitVertHandle')"
    use-icon="mdi-view-split-vertical"
    :use-tooltip="$t('chat.splitRight')"
  />
  <XCommonBtn
    icon
    variant="text"
    @click.stop="$emit('splitHorizHandle')"
    use-icon="mdi-view-split-horizontal"
    :use-tooltip="$t('chat.splitDown')"
  />
  <XCommonBtn
    icon
    variant="text"
    @click.stop="$emit('close')"
    use-icon="mdi-close"
    :use-tooltip="$t('common.close')"
  />
</template>
<script setup lang="ts">
defineEmits<{
  handleNewChat: [];
  splitVertHandle: [];
  splitHorizHandle: [];
  close: [];
}>();
</script>
